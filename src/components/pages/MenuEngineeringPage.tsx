import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Star, TrendingDown, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import type { MenuItemPerformance } from '@/lib/types_menu';

interface Store {
  id: string;
  name: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'star': return <Star className="h-4 w-4 text-[var(--accent)]" />;
    case 'plow_horse': return <TrendingDown className="h-4 w-4 text-primary" />;
    case 'puzzle': return <AlertTriangle className="h-4 w-4 text-[var(--warn)]" />;
    case 'dog': return <XCircle className="h-4 w-4 text-[var(--danger)]" />;
    default: return null;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'star': return 'Star';
    case 'plow_horse': return 'Plow Horse';
    case 'puzzle': return 'Puzzle';
    case 'dog': return 'Dog';
    default: return category;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'star': return 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20';
    case 'plow_horse': return 'bg-primary/10 text-primary border-primary/20';
    case 'puzzle': return 'bg-[var(--warn)]/10 text-[var(--warn)] border-[var(--warn)]/20';
    case 'dog': return 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getRecommendation = (category: string, item: MenuItemPerformance) => {
  switch (category) {
    case 'star':
      return {
        title: 'Proteger y Promover',
        actions: [
          'Feature prominente en menú (primera página)',
          'Incentiva a staff para recomendarlo',
          'Considera aumentar precio 5-10%',
          'NUNCA cambies la receta'
        ]
      };
    case 'plow_horse':
      return {
        title: 'Mejorar Margen',
        actions: [
          `Subir precio: $${item.avg_price.toFixed(2)} → $${(item.avg_price * 1.10).toFixed(2)} (+10%)`,
          'Reducir porción ligeramente (imperceptible)',
          'Usar ingredientes más económicos sin afectar sabor',
          'Hacer bundles para upsell'
        ]
      };
    case 'puzzle':
      return {
        title: 'Reposicionar o Eliminar',
        actions: [
          'Cambiar nombre a algo más apetitoso',
          'Mejor ubicación en menú + foto',
          'Entrenar staff para recomendarlo',
          'Si no mejora en 90 días: ELIMINAR'
        ]
      };
    case 'dog':
      return {
        title: 'Eliminar Inmediatamente',
        actions: [
          'Ocupa espacio mental del cliente',
          'Aumenta complejidad de inventario',
          'Requiere training de staff innecesario',
          'Espacio en menú es valioso - úsalo mejor'
        ]
      };
    default:
      return { title: '', actions: [] };
  }
};

export const MenuEngineeringPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuItemPerformance[]>([]);

  useEffect(() => {
    fetchStores();
    fetchMenuData();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchMenuData();
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase.rpc('get_stores_data');
      if (error) throw error;
      
      const mappedStores = data?.filter(s => s.active).map(s => ({
        id: s.store_id,
        name: s.name
      })) || [];
      setStores(mappedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tiendas',
        variant: 'destructive',
      });
    }
  };

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_menu_engineering_data' as any, {
        p_store_id: selectedStore === 'all' ? null : selectedStore,
        p_days: 30
      });

      if (error) throw error;
      setMenuData((data as any) || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el análisis de menú',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryCounts = {
    star: menuData.filter(i => i.menu_category === 'star').length,
    plow_horse: menuData.filter(i => i.menu_category === 'plow_horse').length,
    puzzle: menuData.filter(i => i.menu_category === 'puzzle').length,
    dog: menuData.filter(i => i.menu_category === 'dog').length,
  };

  const groupedByCategory = {
    star: menuData.filter(i => i.menu_category === 'star'),
    plow_horse: menuData.filter(i => i.menu_category === 'plow_horse'),
    puzzle: menuData.filter(i => i.menu_category === 'puzzle'),
    dog: menuData.filter(i => i.menu_category === 'dog'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menu Engineering</h1>
        <p className="text-muted-foreground">
          Matriz de Smith & Kasavana - Optimiza tu menú para máxima rentabilidad
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Tienda</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tiendas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchMenuData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stars ⭐</CardTitle>
            <Star className="h-4 w-4 text-[var(--accent)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts.star}</div>
            <p className="text-xs text-muted-foreground">
              Alta popularidad + Alto margen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plow Horses 🐴</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts.plow_horse}</div>
            <p className="text-xs text-muted-foreground">
              Alta popularidad + Bajo margen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puzzles 🧩</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[var(--warn)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts.puzzle}</div>
            <p className="text-xs text-muted-foreground">
              Baja popularidad + Alto margen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dogs 🐕</CardTitle>
            <XCircle className="h-4 w-4 text-[var(--danger)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--danger)]">{categoryCounts.dog}</div>
            <p className="text-xs text-muted-foreground">
              Baja popularidad + Bajo margen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      {Object.entries(groupedByCategory).map(([category, items]) => {
        if (items.length === 0) return null;
        
        const recommendation = getRecommendation(category, items[0]);
        
        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {getCategoryIcon(category)}
                <div>
                  <CardTitle>{getCategoryLabel(category)}</CardTitle>
                  <CardDescription>{recommendation.title}</CardDescription>
                </div>
                <Badge className={getCategoryColor(category)}>
                  {items.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Acciones Recomendadas:</p>
                <ul className="space-y-1 text-sm">
                  {recommendation.actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.sku}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Popularidad</p>
                            <p className="font-medium">{item.popularity_pct.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Margen</p>
                            <p className="font-medium">${item.contribution_margin.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Precio</p>
                            <p className="font-medium">${item.avg_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ventas</p>
                            <p className="font-medium">{item.total_qty_sold} unidades</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-lg font-bold">${item.total_revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
