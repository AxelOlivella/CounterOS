import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  theme: any;
  tenant_id: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  tenant_id: string;
  email: string;
  name?: string;
  role?: 'owner' | 'manager' | 'analyst' | 'staff';
  created_at: string;
  updated_at: string;
  auth_user_id: string;
}

interface TenantContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  loading: boolean;
  signOut: () => Promise<void>;
  brandName: string;
  primaryColor: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer to prevent deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setTenant(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Get user info from auth
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user?.email) return;

      // Fetch user profile with tenant data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          tenants(*)
        `)
        .eq('email', authUser.user.email)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      setUserProfile(profile);

      if (profile?.tenants) {
        // Map tenant data to match interface
        const tenantData = profile.tenants;
        const mappedTenant: Tenant = {
          id: tenantData.tenant_id,
          name: tenantData.name,
          subdomain: undefined,
          theme: tenantData.theme,
          tenant_id: tenantData.tenant_id,
          created_at: tenantData.created_at,
        };
        
        setTenant(mappedTenant);
        
        // Also store in localStorage for quick access
        localStorage.setItem('tenant_info', JSON.stringify({
          id: tenantData.tenant_id,
          name: tenantData.name,
          theme: tenantData.theme
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('tenant_info');
  };

  // Compute brand-specific values
  const brandName = tenant?.name ? `${tenant.name}OS` : 'CounterOS';
  const primaryColor = tenant?.theme?.primary || '#8B5CF6';

  return (
    <TenantContext.Provider value={{
      user,
      session,
      userProfile,
      tenant,
      loading,
      signOut,
      brandName,
      primaryColor
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};