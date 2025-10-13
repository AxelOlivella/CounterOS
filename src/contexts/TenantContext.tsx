import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface TenantContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userProfile: any | null;
  tenant: any | null;
}

const TenantContext = createContext<TenantContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  userProfile: null,
  tenant: null,
});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [tenant, setTenant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile and tenant data
    const fetchUserData = async (userId: string) => {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*, tenants(*)')
          .eq('auth_user_id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }

        setUserProfile(profile);
        setTenant(profile?.tenants || null);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setUserProfile(null);
          setTenant(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setTenant(null);
  };

  return (
    <TenantContext.Provider value={{ user, loading, signOut, userProfile, tenant }}>
      {children}
    </TenantContext.Provider>
  );
};