import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
} from '@/components/ui/chart';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { AlertTriangle, Target, TrendingUp } from 'lucide-react';

interface VarianceAnalysisChartProps {
  current: number;
  target: number;
  variance: number;
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
};

export const VarianceAnalysisChart = ({ current, target, variance }: VarianceAnalysisChartProps) => {
  const data = [
    {
      name: 'Food Cost Actual',
      value: current,
      type: 'actual'
    },
    {
      name: 'Meta',
      value: target,
      type: 'target'
    }
  ];

  const getVarianceStatus = () => {
    if (variance > 5) return { status: 'critical', color: 'hsl(var(--danger))', label: 'Crítico' };
    if (variance > 2) return { status: 'warning', color: 'hsl(var(--warning))', label: 'Atención' };
    if (variance > 0) return { status: 'caution', color: 'hsl(var(--accent))', label: 'Precaución' };
    return { status: 'good', color: 'hsl(var(--success))', label: 'Excelente' };
  };

  const varianceStatus = getVarianceStatus();

  const getRecommendations = () => {
    if (variance > 5) {
      return [
        'Revisar inmediatamente los precios de proveedores',
        'Analizar desperdicios y mermas',
        'Evaluar porciones y recetas',
        'Considerar ajustar precios de venta'
      ];
    }
    if (variance > 2) {
      return [
        'Monitorear tendencias de precios',
        'Revisar eficiencia operativa',
        'Optimizar inventarios'
      ];
    }
    if (variance > 0) {
      return [
        'Mantener control actual',
        'Buscar oportunidades de mejora'
      ];
    }
    return [
      'Excelente control de costos',
      'Mantener prácticas actuales'
    ];
  };

  const recommendations = getRecommendations();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análisis de Varianza
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={80}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'actual'
                          ? varianceStatus.color
                          : 'hsl(var(--muted-foreground))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Status Summary */}
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Estado Actual:</span>
              <Badge
                variant={variance > 5 ? 'destructive' : variance > 2 ? 'secondary' : 'default'}
              >
                {varianceStatus.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diferencia:</span>
              <span className={`font-medium ${variance > 0 ? 'text-danger' : 'text-success'}`}>
                {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Status */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  variance > 5 ? 'bg-red-100 text-red-600' :
                  variance > 2 ? 'bg-amber-100 text-amber-600' :
                  variance > 0 ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Análisis del Food Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    Tu food cost actual es {current.toFixed(1)}% vs una meta del {target}%.
                    {variance > 0 
                      ? ` Esto representa un exceso de ${Math.abs(variance).toFixed(1)} puntos porcentuales.`
                      : ` Estás ${Math.abs(variance).toFixed(1)} puntos por debajo de la meta.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="font-medium mb-3">Acciones Recomendadas:</h4>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <h5 className="font-medium text-sm mb-2">Impacto Financiero</h5>
              <div className="text-xs text-muted-foreground">
                {variance > 0 
                  ? `Un exceso del ${variance.toFixed(1)}% puede representar pérdidas significativas en márgenes.`
                  : `Excelente control mantiene la rentabilidad objetivo.`
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};