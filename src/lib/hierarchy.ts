import { supabase } from '@/integrations/supabase/client';

export interface Corporate {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface LegalEntity {
  id: string;
  corporate_id: string;
  name: string;
  rfc: string;
  tax_regime: string | null;
  tax_address: string | null;
}

export interface Brand {
  id: string;
  legal_entity_id: string;
  name: string;
  slug: string;
  concept: string;
  description: string | null;
  branding: {
    logo?: string;
    primary_color?: string;
    secondary_color?: string;
  };
  target_food_cost: number;
}

/**
 * Get cached tenant ID from session storage
 */
export async function getTenantCached(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    
    // Get tenant_id from users table
    const cached = sessionStorage.getItem(`tenant_${data.user.id}`);
    if (cached) return cached;
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get user's tenant ID from database
 */
export async function getUserTenantId(): Promise<string | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('auth_user_id', userData.user.id)
      .single();

    if (error || !data) return null;

    // Cache it
    sessionStorage.setItem(`tenant_${userData.user.id}`, data.tenant_id);
    return data.tenant_id;
  } catch {
    return null;
  }
}
