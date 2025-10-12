import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, Award, AlertCircle } from 'lucide-react';
import type { SupplierPerformance } from '@/lib/types_menu';

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreBadgeVariant = (score: number) => {
  if (score >= 8) return 'default';
  if (score >= 6) return 'secondary';
  return 'destructive';
};

export const SupplierManagementPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_supplier_performance' as any);
      if (error) throw error;
      setSuppliers((data as any) || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de proveedores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const topSuppliers = suppliers.slice(0, 3);
  const totalSpent = suppliers.reduce((sum, s) => sum + s.total_spent, 0);
  const avgScore = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + s.weighted_score, 0) / suppliers.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
        <p className="text-muted-foreground">
          Scorecard multidimensional y análisis de performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.filter(s => s.active).length}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Weighted average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topSuppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 3 Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSuppliers.map((supplier, idx) => (
                <div key={supplier.supplier_id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{supplier.name}</h4>
                      {supplier.rfc && (
                        <Badge variant="outline" className="text-xs">
                          {supplier.rfc}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supplier.total_purchases} compras • ${supplier.total_spent.toLocaleString()} gastado
                    </p>
                  </div>
                  <Badge className={getScoreBadgeVariant(supplier.weighted_score)}>
                    {supplier.weighted_score.toFixed(1)}/10
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>No hay proveedores registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div key={supplier.supplier_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-lg">{supplier.name}</h4>
                        {!supplier.active && (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                      {supplier.rfc && (
                        <p className="text-sm text-muted-foreground">RFC: {supplier.rfc}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Términos: {supplier.payment_terms} ({supplier.payment_terms_days} días)
                      </p>
                    </div>
                    <Badge className={getScoreBadgeVariant(supplier.weighted_score)} >
                      Score: {supplier.weighted_score.toFixed(1)}/10
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Precio</p>
                      <p className={`font-medium ${getScoreColor(supplier.price_score || 7)}`}>
                        {(supplier.price_score || 7).toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Calidad</p>
                      <p className={`font-medium ${getScoreColor(supplier.quality_score || 7)}`}>
                        {(supplier.quality_score || 7).toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Puntualidad</p>
                      <p className={`font-medium ${getScoreColor(supplier.delivery_score || 7)}`}>
                        {(supplier.delivery_score || 7).toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Servicio</p>
                      <p className={`font-medium ${getScoreColor(supplier.service_score || 7)}`}>
                        {(supplier.service_score || 7).toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Términos</p>
                      <p className={`font-medium ${getScoreColor(supplier.payment_terms_score || 7)}`}>
                        {(supplier.payment_terms_score || 7).toFixed(1)}/10
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Compras Totales</p>
                      <p className="font-medium">{supplier.total_purchases}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gasto Total</p>
                      <p className="font-medium">${supplier.total_spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                      <p className="font-medium">{supplier.purchases_last_30d} compras</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
