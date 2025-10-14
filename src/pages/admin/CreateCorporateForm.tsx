import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CorporateFormData {
  name: string;
  slug: string;
  logo_url: string;
  rfc: string;
  legal_entity_name: string;
  tax_regime: string;
  tax_address: string;
}

export default function CreateCorporateForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CorporateFormData>({
    name: '',
    slug: '',
    logo_url: '',
    rfc: '',
    legal_entity_name: '',
    tax_regime: '',
    tax_address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create corporate
      const { data: corporate, error: corpError } = await supabase
        .from('corporates')
        .insert({
          name: formData.name,
          slug: formData.slug,
          logo_url: formData.logo_url || null,
        })
        .select()
        .single();

      if (corpError) throw corpError;

      // 2. Create legal entity
      const { data: legalEntity, error: leError } = await supabase
        .from('legal_entities')
        .insert({
          corporate_id: corporate.id,
          name: formData.legal_entity_name,
          rfc: formData.rfc,
          tax_regime: formData.tax_regime || null,
          tax_address: formData.tax_address || null,
        })
        .select()
        .single();

      if (leError) throw leError;

      // 3. Create default brand
      const { error: brandError } = await supabase
        .from('brands')
        .insert({
          legal_entity_id: legalEntity.id,
          name: 'Marca Principal',
          slug: 'principal',
          concept: 'fast_casual',
          target_food_cost: 30.0,
        });

      if (brandError) throw brandError;

      // 4. Grant access to current user
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', userData.user.id)
          .single();

        if (userProfile) {
          await supabase.from('corporate_users').insert({
            user_id: userProfile.id,
            corporate_id: corporate.id,
            role: 'admin',
            access_scope: 'corporate',
          });
        }
      }

      toast({
        title: 'Corporativo creado exitosamente',
        description: `${formData.name} ha sido configurado con éxito.`,
      });

      // Reset form
      setFormData({
        name: '',
        slug: '',
        logo_url: '',
        rfc: '',
        legal_entity_name: '',
        tax_regime: '',
        tax_address: '',
      });
    } catch (error: any) {
      console.error('Error creating corporate:', error);
      toast({
        title: 'Error al crear corporativo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. Información del Grupo</h3>
        
        <div>
          <Label htmlFor="name">Nombre del Corporativo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Grupo MYT"
            required
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug (URL-friendly) *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="Ej: grupo-myt"
            required
          />
        </div>

        <div>
          <Label htmlFor="logo_url">URL del Logo (opcional)</Label>
          <Input
            id="logo_url"
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. Razón Social (RFC)</h3>
        
        <div>
          <Label htmlFor="legal_entity_name">Razón Social *</Label>
          <Input
            id="legal_entity_name"
            value={formData.legal_entity_name}
            onChange={(e) => setFormData({ ...formData, legal_entity_name: e.target.value })}
            placeholder="Ej: Grupo MYT SA de CV"
            required
          />
        </div>

        <div>
          <Label htmlFor="rfc">RFC *</Label>
          <Input
            id="rfc"
            value={formData.rfc}
            onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
            placeholder="Ej: MYT123456ABC"
            maxLength={13}
            required
          />
        </div>

        <div>
          <Label htmlFor="tax_regime">Régimen Fiscal (opcional)</Label>
          <Input
            id="tax_regime"
            value={formData.tax_regime}
            onChange={(e) => setFormData({ ...formData, tax_regime: e.target.value })}
            placeholder="Ej: Régimen General"
          />
        </div>

        <div>
          <Label htmlFor="tax_address">Dirección Fiscal (opcional)</Label>
          <Textarea
            id="tax_address"
            value={formData.tax_address}
            onChange={(e) => setFormData({ ...formData, tax_address: e.target.value })}
            placeholder="Calle, número, colonia, ciudad, estado, CP"
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creando...
          </>
        ) : (
          'Crear Corporativo'
        )}
      </Button>
    </form>
  );
}
