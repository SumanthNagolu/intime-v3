/**
 * Role-Based Access Control (RBAC) Helpers
 */

import { createClient } from '@/lib/supabase/server';

export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
  });
  return data === true;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('user_is_admin', { p_user_id: userId });
  return data === true;
}

export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('user_has_role', {
    p_user_id: userId,
    p_role_name: roleName,
  });
  return data === true;
}
