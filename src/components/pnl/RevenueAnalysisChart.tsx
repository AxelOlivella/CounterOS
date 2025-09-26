import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Store } from 'lucide-react';

interface RevenueData {
  store: string;
  revenue: number;
  transactions: number;
  avgTicket: number;
}

interface RevenueAnalysisChartProps {
  data: RevenueData[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
];

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
  transactions: {
    label: "Transacciones",
    color: "hsl(var(--secondary))",
  },
};

export const RevenueAnalysisChart = ({ data }: RevenueAnalysisChartProps) => {
  const totalRevenue = data.reduce((sum, store) => sum + store.revenue, 0);
  const totalTransactions = data.reduce((sum, store) => sum + store.transactions, 0);
  const avgTicketOverall = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ingresos:</span>
              <span className="font-medium">${data.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Transacciones:</span>
              <span className="font-medium">{data.transactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ticket Promedio:</span>
              <span className="font-medium">${data.avgTicket.toFixed(0)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
      
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{data.store}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ingresos:</span>
              <span className="font-medium">${data.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Participación:</span>
              <span className="font-medium text-primary">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue by Store Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ingresos por Tienda
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: ${totalRevenue.toLocaleString()} • {totalTransactions.toLocaleString()} transacciones
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="store"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Distribución de Ingresos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ticket promedio general: ${avgTicketOverall.toFixed(0)}
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="revenue"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.map((entry, index) => {
              const percentage = totalRevenue > 0 ? (entry.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={entry.store} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{entry.store}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Table */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Métricas de Rendimiento por Tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Tienda</th>
                  <th className="text-right p-3 font-medium">Ingresos</th>
                  <th className="text-right p-3 font-medium">Transacciones</th>
                  <th className="text-right p-3 font-medium">Ticket Promedio</th>
                  <th className="text-right p-3 font-medium">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((store, index) => {
                    const percentage = totalRevenue > 0 ? (store.revenue / totalRevenue) * 100 : 0;
                    return (
                      <tr key={store.store} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{store.store}</span>
                          </div>
                        </td>
                        <td className="text-right p-3 font-mono">
                          ${store.revenue.toLocaleString()}
                        </td>
                        <td className="text-right p-3 font-mono">
                          {store.transactions.toLocaleString()}
                        </td>
                        <td className="text-right p-3 font-mono">
                          ${store.avgTicket.toFixed(0)}
                        </td>
                        <td className="text-right p-3 font-mono text-primary">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};