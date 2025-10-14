import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';

export type CorporateRole = 'admin' | 'analyst' | 'viewer';
export type AccessScope = 'corporate' | 'brand' | 'store';

export interface CorporateUser {
  id: string;
  user_id: string;
  corporate_id: string;
  role: CorporateRole;
  access_scope: AccessScope;
  access_filter: {
    brand_ids?: string[];
    store_ids?: string[];
  };
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface CreateCorporateUserInput {
  user_id: string;
  corporate_id: string;
  role: CorporateRole;
  access_scope: AccessScope;
  access_filter?: {
    brand_ids?: string[];
    store_ids?: string[];
  };
}

/**
 * Hook para obtener usuarios de un corporate
 * 
 * @param corporateId - ID del corporate
 * @returns Lista de usuarios con sus roles y permisos
 * 
 * @example
 * const { data: users, isLoading } = useCorporateUsers('corporate-uuid');
 */
export function useCorporateUsers(corporateId: string | undefined) {
  return useQuery({
    queryKey: ['corporate-users', corporateId],
    queryFn: async (): Promise<CorporateUser[]> => {
      if (!corporateId) {
        throw new Error('Corporate ID requerido');
      }

      logger.info('[useCorporateUsers] Fetching users', { corporateId });

      const { data, error } = await supabase
        .from('corporate_users')
        .select('*')
        .eq('corporate_id', corporateId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[useCorporateUsers] Error fetching users', error);
        throw error;
      }

      // TODO: Enriquecer con info de users table (email, name)
      // Cast types para TypeScript
      return (data || []) as CorporateUser[];
    },
    enabled: !!corporateId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000
  });
}

/**
 * Hook para obtener el rol del usuario actual en un corporate
 * 
 * @example
 * const { data: myRole } = useMyRole('corporate-uuid');
 * if (myRole?.role === 'admin') {
 *   // Mostrar opciones de admin
 * }
 */
export function useMyRole(corporateId: string | undefined) {
  return useQuery({
    queryKey: ['my-role', corporateId],
    queryFn: async (): Promise<CorporateUser | null> => {
      if (!corporateId) {
        throw new Error('Corporate ID requerido');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      logger.info('[useMyRole] Fetching my role', { corporateId, userId: user.id });

      const { data, error } = await supabase
        .from('corporate_users')
        .select('*')
        .eq('corporate_id', corporateId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('[useMyRole] Error fetching role', error);
        throw error;
      }

      return data as CorporateUser | null;
    },
    enabled: !!corporateId,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para agregar un usuario a un corporate
 * 
 * @example
 * const addUser = useAddCorporateUser();
 * 
 * addUser.mutate({
 *   user_id: 'user-uuid',
 *   corporate_id: 'corporate-uuid',
 *   role: 'analyst',
 *   access_scope: 'brand',
 *   access_filter: { brand_ids: ['brand-1', 'brand-2'] }
 * });
 */
export function useAddCorporateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCorporateUserInput) => {
      logger.info('[useAddCorporateUser] Adding user', input);

      const { data, error } = await supabase
        .from('corporate_users')
        .insert({
          user_id: input.user_id,
          corporate_id: input.corporate_id,
          role: input.role,
          access_scope: input.access_scope,
          access_filter: input.access_filter || {}
        })
        .select()
        .single();

      if (error) {
        logger.error('[useAddCorporateUser] Error adding user', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      logger.info('[useAddCorporateUser] User added successfully', data);
      
      queryClient.invalidateQueries({ queryKey: ['corporate-users'] });
      
      toast({
        title: "Usuario agregado",
        description: `Usuario agregado al corporate exitosamente`,
      });
    },
    onError: (error: any) => {
      logger.error('[useAddCorporateUser] Mutation failed', error);
      
      let description = error.message || "Ocurrió un error inesperado";
      
      // Mensaje específico si ya existe
      if (error.code === '23505') {
        description = "El usuario ya tiene acceso a este corporate";
      }
      
      toast({
        title: "Error al agregar usuario",
        description,
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook para actualizar rol/permisos de un usuario
 */
export function useUpdateCorporateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      corporateUserId, 
      updates 
    }: { 
      corporateUserId: string; 
      updates: Partial<Pick<CorporateUser, 'role' | 'access_scope' | 'access_filter'>>
    }) => {
      logger.info('[useUpdateCorporateUser] Updating user', { corporateUserId, updates });

      const { data, error } = await supabase
        .from('corporate_users')
        .update(updates)
        .eq('id', corporateUserId)
        .select()
        .single();

      if (error) {
        logger.error('[useUpdateCorporateUser] Error updating user', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      logger.info('[useUpdateCorporateUser] User updated successfully', data);
      
      queryClient.invalidateQueries({ queryKey: ['corporate-users'] });
      queryClient.invalidateQueries({ queryKey: ['my-role'] });
      
      toast({
        title: "Permisos actualizados",
        description: "Los permisos del usuario fueron actualizados exitosamente",
      });
    },
    onError: (error: any) => {
      logger.error('[useUpdateCorporateUser] Mutation failed', error);
      
      toast({
        title: "Error al actualizar permisos",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook para remover un usuario de un corporate
 */
export function useRemoveCorporateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (corporateUserId: string) => {
      logger.info('[useRemoveCorporateUser] Removing user', { corporateUserId });

      const { error } = await supabase
        .from('corporate_users')
        .delete()
        .eq('id', corporateUserId);

      if (error) {
        logger.error('[useRemoveCorporateUser] Error removing user', error);
        throw error;
      }

      return corporateUserId;
    },
    onSuccess: (corporateUserId) => {
      logger.info('[useRemoveCorporateUser] User removed successfully', { corporateUserId });
      
      queryClient.invalidateQueries({ queryKey: ['corporate-users'] });
      
      toast({
        title: "Usuario removido",
        description: "El usuario fue removido del corporate exitosamente",
      });
    },
    onError: (error: any) => {
      logger.error('[useRemoveCorporateUser] Mutation failed', error);
      
      toast({
        title: "Error al remover usuario",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  });
}

/**
 * Helper: Verificar si usuario tiene permiso específico
 * 
 * @example
 * const { data: myRole } = useMyRole(corporateId);
 * const canManageBrands = hasPermission(myRole, 'admin');
 */
export function hasPermission(
  userRole: CorporateUser | null | undefined,
  requiredRole: CorporateRole
): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<CorporateRole, number> = {
    admin: 3,
    analyst: 2,
    viewer: 1
  };

  return roleHierarchy[userRole.role] >= roleHierarchy[requiredRole];
}
