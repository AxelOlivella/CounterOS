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
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrendData {
  date: string;
  foodCostPercent: number;
  purchases: number;
  sales: number;
}

interface FoodCostTrendChartProps {
  data: TrendData[];
}

const chartConfig = {
  foodCostPercent: {
    label: "Food Cost %",
    color: "hsl(var(--primary))",
  },
  target: {
    label: "Meta",
    color: "hsl(var(--muted-foreground))",
  },
};

export const FoodCostTrendChart = ({ data }: FoodCostTrendChartProps) => {
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return format(date, 'dd/MM', { locale: es });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = format(date, 'dd MMMM yyyy', { locale: es });
      
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{formattedDate}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Food Cost:</span>
              <span className="font-medium text-primary">
                {payload[0]?.value?.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Compras:</span>
              <span className="font-medium">
                ${payload[0]?.payload?.purchases?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Ventas:</span>
              <span className="font-medium">
                ${payload[0]?.payload?.sales?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const avgFoodCost = data.length > 0 
    ? data.reduce((sum, d) => sum + d.foodCostPercent, 0) / data.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencia Food Cost
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Promedio del período: {avgFoodCost.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<CustomTooltip />} />
              
              {/* Target line */}
              <ReferenceLine 
                y={30} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                label={{ value: "Meta 30%", position: "insideTopRight" }}
              />
              
              {/* Food cost trend line */}
              <Line
                type="monotone"
                dataKey="foodCostPercent"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ 
                  fill: "hsl(var(--primary))", 
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                  r: 4
                }}
                activeDot={{ 
                  r: 6, 
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};