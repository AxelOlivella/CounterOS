import { supabase } from '@/integrations/supabase/client';

export type CorporateRole = 'admin' | 'analyst' | 'viewer';
export type AccessScope = 'corporate' | 'brand' | 'store';

export interface AccessFilter {
  brand_ids?: string[];
  store_ids?: string[];
}

export interface CorporateAccess {
  corporate_id: string;
  role: CorporateRole;
  access_scope: AccessScope;
  access_filter: AccessFilter;
}

/**
 * Get current user's corporate access
 */
export async function getUserCorporateAccess(): Promise<CorporateAccess | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    // Get user's profile first
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userData.user.id)
      .single();

    if (!userProfile) return null;

    const { data, error } = await supabase
      .from('corporate_users')
      .select('*')
      .eq('user_id', userProfile.id)
      .single();

    if (error || !data) return null;

    return {
      corporate_id: data.corporate_id,
      role: data.role as CorporateRole,
      access_scope: data.access_scope as AccessScope,
      access_filter: (data.access_filter as AccessFilter) || {}
    };
  } catch {
    return null;
  }
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(
  access: CorporateAccess | null,
  requiredRole: CorporateRole
): boolean {
  if (!access) return false;

  const roleHierarchy: Record<CorporateRole, number> = {
    admin: 3,
    analyst: 2,
    viewer: 1
  };

  return roleHierarchy[access.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can access a specific brand
 */
export function canAccessBrand(
  access: CorporateAccess | null,
  brandId: string
): boolean {
  if (!access) return false;
  if (access.access_scope === 'corporate') return true;
  if (access.access_scope === 'brand') {
    return access.access_filter.brand_ids?.includes(brandId) ?? false;
  }
  return false;
}

/**
 * Check if user can access a specific store
 */
export function canAccessStore(
  access: CorporateAccess | null,
  storeId: string
): boolean {
  if (!access) return false;
  if (access.access_scope === 'corporate' || access.access_scope === 'brand') return true;
  if (access.access_scope === 'store') {
    return access.access_filter.store_ids?.includes(storeId) ?? false;
  }
  return false;
}
