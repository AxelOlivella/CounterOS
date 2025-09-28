// Database helpers for CounterOS
// Safe addition - connects to existing Supabase integration

export { supabase } from '@/integrations/supabase/client';

// Demo tenant ID for development
export const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

// Helper function to get current user's tenant
export const getCurrentTenant = async () => {
  // For now, return demo tenant
  // TODO: Implement proper tenant resolution from user profile
  return DEMO_TENANT_ID;
};