import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TrendData {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}

interface ProfitabilityTrendChartProps {
  data: TrendData[];
}

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
  grossProfit: {
    label: "Utilidad Bruta",
    color: "hsl(var(--success))",
  },
  netProfit: {
    label: "Utilidad Neta",
    color: "hsl(var(--secondary))",
  },
  grossMargin: {
    label: "Margen Bruto",
    color: "hsl(var(--success))",
  },
  netMargin: {
    label: "Margen Neto",
    color: "hsl(var(--secondary))",
  },
};

export const ProfitabilityTrendChart = ({ data }: ProfitabilityTrendChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.dataKey}:</span>
                </div>
                <span className="font-medium">
                  {entry.dataKey.includes('Margin') || entry.dataKey.includes('margin')
                    ? `${entry.value.toFixed(1)}%`
                    : `$${entry.value.toLocaleString()}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const averageGrossMargin = data.length > 0 
    ? data.reduce((sum, d) => sum + d.grossMargin, 0) / data.length 
    : 0;

  const averageNetMargin = data.length > 0 
    ? data.reduce((sum, d) => sum + d.netMargin, 0) / data.length 
    : 0;

  return (
    <div className="grid gap-6">
      {/* Revenue and Profit Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de Ingresos y Utilidades
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolución mensual de ingresos y utilidades
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Ingresos"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="grossProfit"
                  name="Utilidad Bruta"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netProfit"
                  name="Utilidad Neta"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Margin Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolución de Márgenes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Margen bruto promedio: {averageGrossMargin.toFixed(1)}% • 
            Margen neto promedio: {averageNetMargin.toFixed(1)}%
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />

                {/* Reference lines for targets */}
                <ReferenceLine 
                  y={60} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.5}
                  label={{ value: "Meta Margen Bruto 60%", position: "insideTopRight" }}
                />
                <ReferenceLine 
                  y={20} 
                  stroke="hsl(var(--secondary))" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.5}
                  label={{ value: "Meta Margen Neto 20%", position: "insideTopRight" }}
                />

                <Line
                  type="monotone"
                  dataKey="grossMargin"
                  name="Margen Bruto %"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ 
                    fill: "hsl(var(--success))", 
                    strokeWidth: 2,
                    stroke: "hsl(var(--background))",
                    r: 4
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: "hsl(var(--success))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="netMargin"
                  name="Margen Neto %"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ 
                    fill: "hsl(var(--secondary))", 
                    strokeWidth: 2,
                    stroke: "hsl(var(--background))",
                    r: 4
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: "hsl(var(--secondary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Best Month */}
            <div className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg">
              <h4 className="font-medium text-[var(--accent)] mb-2">Mejor Mes</h4>
              {(() => {
                if (data.length === 0) return <div>Sin datos disponibles</div>;
                
                const bestMonth = data.reduce((best, current) => 
                  current.netProfit > best.netProfit ? current : best
                );
                return (
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-[var(--accent)]">
                      {bestMonth.month}
                    </div>
                    <div className="text-sm text-[var(--accent)]">
                      Utilidad Neta: ${bestMonth.netProfit.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--accent)]">
                      Margen: {bestMonth.netMargin.toFixed(1)}%
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Current Trend */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Tendencia Actual</h4>
              {(() => {
                const lastTwo = data.slice(-2);
                if (lastTwo.length < 2) return <div>Datos insuficientes</div>;
                
                const trend = lastTwo[1].netProfit - lastTwo[0].netProfit;
                const isPositive = trend > 0;
                
                return (
                  <div className="space-y-1">
                    <div className={`text-lg font-semibold ${isPositive ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
                      {isPositive ? '↗️ Creciendo' : '↘️ Declinando'}
                    </div>
                    <div className="text-sm text-primary">
                      Cambio: ${Math.abs(trend).toLocaleString()}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Average Performance */}
            <div className="p-4 bg-[var(--warn)]/10 border border-[var(--warn)]/20 rounded-lg">
              <h4 className="font-medium text-[var(--warn)] mb-2">Promedio del Período</h4>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-[var(--warn)]">
                  Margen Bruto: {averageGrossMargin.toFixed(1)}%
                </div>
                <div className="text-sm text-[var(--warn)]">
                  Margen Neto: {averageNetMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};