// Fix user_profiles to ensure id matches auth_id for consistent role assignment
// This handles users created before the unified signup flow

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
  if (lowerEmail.includes('recruiter') || lowerEmail.includes('rec@')) return 'recruiter'
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

    // Find users with mismatched id and auth_id
    const mismatchedUsers = await sql`
      SELECT up.id, up.auth_id, up.email, up.org_id,
             array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) as roles
      FROM user_profiles up
      LEFT JOIN user_roles ur ON ur.user_id = up.id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE up.auth_id IS NOT NULL
        AND up.id != up.auth_id
        AND up.deleted_at IS NULL
      GROUP BY up.id, up.auth_id, up.email, up.org_id
    `

    // Find users with no roles assigned
    const usersWithoutRoles = await sql`
      SELECT up.id, up.auth_id, up.email, up.org_id
      FROM user_profiles up
      LEFT JOIN user_roles ur ON ur.user_id = up.id
      WHERE up.auth_id IS NOT NULL
        AND up.deleted_at IS NULL
        AND ur.user_id IS NULL
    `

    const results = {
      mismatchedUsers: mismatchedUsers.length,
      usersWithoutRoles: usersWithoutRoles.length,
      fixes: [] as Record<string, unknown>[],
      dryRun,
    }

    if (!dryRun) {
      // Fix mismatched users by updating their id to match auth_id
      for (const user of mismatchedUsers) {
        try {
          // First, check if auth_id already exists as an id (would cause conflict)
          const existing = await sql`
            SELECT id FROM user_profiles WHERE id = ${user.auth_id}
          `

          if (existing.length > 0) {
            // Auth_id already used as id elsewhere - skip this user
            results.fixes.push({
              email: user.email,
              action: 'skipped',
              reason: 'auth_id already exists as another profile id'
            })
            continue
          }

          // Delete old user_roles entries for this user
          await sql`
            DELETE FROM user_roles WHERE user_id = ${user.id}
          `

          // Update user_profiles id to match auth_id
          await sql`
            UPDATE user_profiles
            SET id = ${user.auth_id}
            WHERE id = ${user.id}
          `

          // Infer role from email and assign
          const inferredRole = inferRoleFromEmail(user.email)
          if (inferredRole && ROLE_IDS[inferredRole]) {
            await sql`
              INSERT INTO user_roles (user_id, role_id, is_primary)
              VALUES (${user.auth_id}, ${ROLE_IDS[inferredRole]}, true)
              ON CONFLICT (user_id, role_id) DO NOTHING
            `
          }

          results.fixes.push({
            email: user.email,
            action: 'fixed_id_and_role',
            oldId: user.id,
            newId: user.auth_id,
            role: inferredRole
          })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          results.fixes.push({
            email: user.email,
            action: 'error',
            error: errorMessage
          })
        }
      }

      // Assign roles to users without roles
      for (const user of usersWithoutRoles) {
        const inferredRole = inferRoleFromEmail(user.email)
        if (inferredRole && ROLE_IDS[inferredRole]) {
          try {
            await sql`
              INSERT INTO user_roles (user_id, role_id, is_primary)
              VALUES (${user.id}, ${ROLE_IDS[inferredRole]}, true)
              ON CONFLICT (user_id, role_id) DO NOTHING
            `
            results.fixes.push({
              email: user.email,
              action: 'assigned_role',
              role: inferredRole
            })
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            results.fixes.push({
              email: user.email,
              action: 'error',
              error: errorMessage
            })
          }
        } else {
          results.fixes.push({
            email: user.email,
            action: 'skipped',
            reason: 'could not infer role from email'
          })
        }
      }
    } else {
      // Dry run - just report what would be fixed
      for (const user of mismatchedUsers) {
        results.fixes.push({
          email: user.email,
          action: 'would_fix_id',
          oldId: user.id,
          newId: user.auth_id,
          currentRoles: user.roles,
          inferredRole: inferRoleFromEmail(user.email)
        })
      }

      for (const user of usersWithoutRoles) {
        results.fixes.push({
          email: user.email,
          action: 'would_assign_role',
          inferredRole: inferRoleFromEmail(user.email)
        })
      }
    }

    await sql.end()

    return new Response(
      JSON.stringify(results, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
