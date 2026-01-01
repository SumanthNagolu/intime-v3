import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()

    // Find the invitation by token
    const { data: invitation, error: inviteError } = await adminClient
      .from('user_invitations')
      .select(`
        id,
        email,
        first_name,
        last_name,
        org_id,
        expires_at,
        accepted_at,
        cancelled_at,
        organization:organizations!user_invitations_org_id_fkey(name)
      `)
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      console.error('Invitation lookup error:', inviteError)
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json(
        { error: 'This invitation has already been accepted' },
        { status: 400 }
      )
    }

    // Check if cancelled
    if (invitation.cancelled_at) {
      return NextResponse.json(
        { error: 'This invitation has been cancelled' },
        { status: 400 }
      )
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Find the user profile by email (created during invitation)
    const { data: userProfile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, auth_id')
      .eq('email', invitation.email)
      .eq('org_id', invitation.org_id)
      .is('deleted_at', null)
      .single()

    if (profileError || !userProfile) {
      console.error('User profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'User account not found. Please contact your administrator.' },
        { status: 404 }
      )
    }

    // Determine the auth user ID (either auth_id if set, or profile id)
    const authUserId = userProfile.auth_id || userProfile.id

    // Update the user's password in Supabase Auth
    const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
      authUserId,
      { password }
    )

    if (updateAuthError) {
      console.error('Failed to update auth user password:', updateAuthError)
      return NextResponse.json(
        { error: 'Failed to set password. Please try again.' },
        { status: 500 }
      )
    }

    // Update user profile to active status
    const { error: updateProfileError } = await adminClient
      .from('user_profiles')
      .update({
        status: 'active',
        is_active: true,
        password_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id)

    if (updateProfileError) {
      console.error('Failed to update user profile:', updateProfileError)
      // Don't fail - password was set successfully
    }

    // Mark invitation as accepted
    const { error: acceptError } = await adminClient
      .from('user_invitations')
      .update({
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (acceptError) {
      console.error('Failed to mark invitation as accepted:', acceptError)
      // Don't fail - user can still log in
    }

    // Create audit log
    await adminClient.from('audit_logs').insert({
      org_id: invitation.org_id,
      user_id: userProfile.id,
      user_email: invitation.email,
      action: 'accept_invitation',
      table_name: 'user_invitations',
      record_id: invitation.id,
      new_values: {
        email: invitation.email,
        accepted_at: new Date().toISOString(),
      },
    })

    // Extract org name
    const orgData = Array.isArray(invitation.organization)
      ? invitation.organization[0]
      : invitation.organization

    // Send welcome email (fire and forget)
    sendWelcomeEmail({
      to: invitation.email,
      firstName: invitation.first_name || 'there',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
      orgName: orgData?.name,
    }).catch((err) => {
      console.error('Failed to send welcome email:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
