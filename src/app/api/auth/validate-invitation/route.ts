import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    )
  }

  try {
    const adminClient = getAdminClient()

    // Find the invitation by token
    const { data: invitation, error: inviteError } = await adminClient
      .from('user_invitations')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role_id,
        org_id,
        expires_at,
        accepted_at,
        cancelled_at,
        invited_by,
        inviter:user_profiles!user_invitations_invited_by_fkey(full_name, email),
        role:system_roles!user_invitations_role_id_fkey(display_name),
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
        { error: 'This invitation has already been accepted. Please login to continue.' },
        { status: 400 }
      )
    }

    // Check if cancelled
    if (invitation.cancelled_at) {
      return NextResponse.json(
        { error: 'This invitation has been cancelled. Please contact your administrator.' },
        { status: 400 }
      )
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired. Please contact your administrator for a new invitation.' },
        { status: 400 }
      )
    }

    // Extract inviter info (handle array vs object from Supabase)
    const inviterData = Array.isArray(invitation.inviter)
      ? invitation.inviter[0]
      : invitation.inviter
    const roleData = Array.isArray(invitation.role)
      ? invitation.role[0]
      : invitation.role
    const orgData = Array.isArray(invitation.organization)
      ? invitation.organization[0]
      : invitation.organization

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        firstName: invitation.first_name,
        lastName: invitation.last_name,
        orgName: orgData?.name || 'Your Organization',
        roleName: roleData?.display_name || 'Team Member',
        invitedBy: inviterData?.full_name || inviterData?.email || 'Your Administrator',
        expiresAt: invitation.expires_at,
      },
    })
  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    )
  }
}
