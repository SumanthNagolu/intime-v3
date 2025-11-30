import { NextResponse } from 'next/server';
import { getCurrentUser, getUserProfile, getUserRoles } from '@/lib/auth/server';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await getUserProfile();
    const roles = await getUserRoles();

    return NextResponse.json({
      auth_user: {
        id: user.id,
        email: user.email,
      },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        auth_id: profile.auth_id,
      } : null,
      roles,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
