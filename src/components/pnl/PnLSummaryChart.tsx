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
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface PnLData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  laborCosts: number;
  otherExpenses: number;
  totalOperatingExpenses: number;
  ebitda: number;
  ebitdaMargin: number;
  netProfit: number;
  netMargin: number;
}

interface PnLSummaryChartProps {
  data: PnLData;
}

const chartConfig = {
  amount: {
    label: "Monto",
    color: "hsl(var(--primary))",
  },
};

export const PnLSummaryChart = ({ data }: PnLSummaryChartProps) => {
  const chartData = [
    {
      category: 'Ingresos',
      amount: data.revenue,
      type: 'revenue'
    },
    {
      category: 'Costo de Ventas',
      amount: -data.cogs,
      type: 'expense'
    },
    {
      category: 'Gastos de Nómina',
      amount: -data.laborCosts,
      type: 'expense'
    },
    {
      category: 'Otros Gastos',
      amount: -data.otherExpenses,
      type: 'expense'
    },
    {
      category: 'Utilidad Neta',
      amount: data.netProfit,
      type: 'profit'
    }
  ];

  const getBarColor = (type: string) => {
    switch (type) {
      case 'revenue':
        return 'hsl(var(--success))';
      case 'expense':
        return 'hsl(var(--danger))';
      case 'profit':
        return 'hsl(var(--primary))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isNegative = value < 0;
      
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Monto:</span>
            <span className="font-medium">
              ${Math.abs(value).toLocaleString()}
              {isNegative && ' (gasto)'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Resumen P&L Waterfall
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="category"
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
                tickFormatter={(value) => `$${(Math.abs(value) / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.type)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};