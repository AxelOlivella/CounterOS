import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBrands } from '@/hooks/useBrands';
import { useLegalEntities } from '@/hooks/useLegalEntities';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CONCEPTS = [
  { value: 'sushi', label: '🍣 Sushi' },
  { value: 'crepas', label: '🥞 Crepas' },
  { value: 'cafe', label: '☕ Café' },
  { value: 'hamburguesas', label: '🍔 Hamburguesas' },
  { value: 'tacos', label: '🌮 Tacos' },
  { value: 'froyo', label: '🍦 Frozen Yogurt' },
  { value: 'pizza', label: '🍕 Pizza' },
  { value: 'fast_casual', label: '🍴 Fast Casual' },
  { value: 'casual_dining', label: '🍽️ Casual Dining' },
  { value: 'fine_dining', label: '⭐ Fine Dining' },
  { value: 'other', label: '📦 Otro' },
];

interface BrandFormData {
  legal_entity_id: string;
  name: string;
  slug: string;
  concept: string;
  description: string;
  target_food_cost: number;
}

export default function BrandManagement() {
  const { toast } = useToast();
  const { data: brands, isLoading: loadingBrands, refetch: refetchBrands } = useBrands();
  const { data: legalEntities } = useLegalEntities();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    legal_entity_id: '',
    name: '',
    slug: '',
    concept: 'fast_casual',
    description: '',
    target_food_cost: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBrand) {
        // Update existing brand
        const { error } = await supabase
          .from('brands')
          .update({
            name: formData.name,
            slug: formData.slug,
            concept: formData.concept,
            description: formData.description || null,
            target_food_cost: formData.target_food_cost,
          })
          .eq('id', editingBrand.id);

        if (error) throw error;

        toast({
          title: 'Marca actualizada',
          description: `${formData.name} ha sido actualizada exitosamente.`,
        });
      } else {
        // Create new brand
        const { error } = await supabase
          .from('brands')
          .insert({
            legal_entity_id: formData.legal_entity_id,
            name: formData.name,
            slug: formData.slug,
            concept: formData.concept,
            description: formData.description || null,
            target_food_cost: formData.target_food_cost,
          });

        if (error) throw error;

        toast({
          title: 'Marca creada',
          description: `${formData.name} ha sido creada exitosamente.`,
        });
      }

      setOpen(false);
      setEditingBrand(null);
      resetForm();
      refetchBrands();
    } catch (error: any) {
      console.error('Error saving brand:', error);
      toast({
        title: 'Error al guardar marca',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      legal_entity_id: brand.legal_entity_id,
      name: brand.name,
      slug: brand.slug,
      concept: brand.concept,
      description: brand.description || '',
      target_food_cost: brand.target_food_cost,
    });
    setOpen(true);
  };

  const handleDelete = async (brandId: string, brandName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la marca "${brandName}"?`)) return;

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;

      toast({
        title: 'Marca eliminada',
        description: `${brandName} ha sido eliminada.`,
      });

      refetchBrands();
    } catch (error: any) {
      toast({
        title: 'Error al eliminar marca',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      legal_entity_id: '',
      name: '',
      slug: '',
      concept: 'fast_casual',
      description: '',
      target_food_cost: 30,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingBrand(null);
      resetForm();
    }
  };

  if (loadingBrands) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestión de Marcas</h2>
          <p className="text-sm text-muted-foreground">
            Administra las marcas comerciales de tu corporativo
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Editar Marca' : 'Crear Nueva Marca'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingBrand && (
                <div>
                  <Label htmlFor="legal_entity_id">Razón Social (RFC) *</Label>
                  <Select
                    value={formData.legal_entity_id}
                    onValueChange={(value) => setFormData({ ...formData, legal_entity_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar RFC..." />
                    </SelectTrigger>
                    <SelectContent>
                      {legalEntities?.map((le) => (
                        <SelectItem key={le.id} value={le.id}>
                          {le.name} ({le.rfc})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="name">Nombre de la Marca *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Moshi Moshi"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="Ej: moshi-moshi"
                  required
                />
              </div>

              <div>
                <Label htmlFor="concept">Concepto *</Label>
                <Select
                  value={formData.concept}
                  onValueChange={(value) => setFormData({ ...formData, concept: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCEPTS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_food_cost">Target Food Cost (%) *</Label>
                <Input
                  id="target_food_cost"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.target_food_cost}
                  onChange={(e) => setFormData({ ...formData, target_food_cost: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción de la marca..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : editingBrand ? (
                    'Actualizar'
                  ) : (
                    'Crear Marca'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {brands && brands.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No hay marcas creadas aún</p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Marca
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {brands?.map((brand) => (
            <div
              key={brand.id}
              className="p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{brand.name}</h3>
                    <Badge variant="secondary">
                      {CONCEPTS.find(c => c.value === brand.concept)?.label || brand.concept}
                    </Badge>
                  </div>
                  
                  {brand.legal_entity && (
                    <p className="text-sm text-muted-foreground mb-2">
                      RFC: {brand.legal_entity.rfc} • {brand.legal_entity.name}
                    </p>
                  )}

                  {brand.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {brand.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span>Target FC: <strong>{brand.target_food_cost}%</strong></span>
                    <span>Tiendas: <strong>{brand._count?.stores || 0}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(brand)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(brand.id, brand.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
