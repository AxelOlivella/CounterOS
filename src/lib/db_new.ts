// Database helpers for CounterOS
// Safe addition - connects to existing Supabase integration

import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Demo tenant ID for development
export const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

// Helper function to get current user's tenant
export const getCurrentTenant = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch user profile with tenant information
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!userProfile) {
    throw new Error('User profile not found. Please complete onboarding first.');
  }

  return userProfile.tenant_id;
};