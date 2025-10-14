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
  Treemap,
} from 'recharts';
import { PieChart as PieChartIcon, TrendingDown } from 'lucide-react';

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpenseBreakdownChartProps {
  data: ExpenseData[];
}

const COLORS = [
  'hsl(var(--danger))',
  'hsl(var(--warning))',
  'hsl(var(--accent))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--secondary))',
];

const chartConfig = {
  amount: {
    label: "Monto",
    color: "hsl(var(--danger))",
  },
};

export const ExpenseBreakdownChart = ({ data }: ExpenseBreakdownChartProps) => {
  const totalExpenses = data.reduce((sum, expense) => sum + expense.amount, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium">${data.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Porcentaje:</span>
              <span className="font-medium text-primary">
                {data.percentage.toFixed(1)}%
              </span>
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
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">{data.category}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium">${data.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Porcentaje:</span>
              <span className="font-medium text-primary">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare treemap data
  const treemapData = data.map((expense, index) => ({
    ...expense,
    size: expense.amount,
    fill: COLORS[index % COLORS.length]
  }));

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors } = props;

    if (depth === 1) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: payload.fill,
              stroke: '#fff',
              strokeWidth: 2 / (depth + 1e-10),
              strokeOpacity: 1 / (depth + 1e-10),
            }}
          />
          {width > 50 && height > 30 && (
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={width > 100 ? 14 : 10}
              fontWeight="bold"
            >
              <tspan x={x + width / 2} dy="-0.5em">
                {payload.category}
              </tspan>
              <tspan x={x + width / 2} dy="1.2em" fontSize={width > 100 ? 12 : 8}>
                ${(payload.amount / 1000).toFixed(0)}k
              </tspan>
            </text>
          )}
        </g>
      );
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Gastos por Categoría
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total de gastos: ${totalExpenses.toLocaleString()}
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribución de Gastos
          </CardTitle>
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
                  dataKey="amount"
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
            {data.map((entry, index) => (
              <div key={entry.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{entry.category}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {entry.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Treemap */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Mapa de Gastos por Tamaño</CardTitle>
          <p className="text-sm text-muted-foreground">
            El tamaño representa la proporción del gasto total
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<CustomizedContent />}
              />
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Expense Analysis Table */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Análisis Detallado de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Categoría</th>
                  <th className="text-right p-3 font-medium">Monto</th>
                  <th className="text-right p-3 font-medium">% del Total</th>
                  <th className="text-right p-3 font-medium">Impacto</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .sort((a, b) => b.amount - a.amount)
                  .map((expense, index) => {
                    const isHighImpact = expense.percentage > 25;
                    const isMediumImpact = expense.percentage > 10;
                    
                    return (
                      <tr key={expense.category} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{expense.category}</span>
                          </div>
                        </td>
                        <td className="text-right p-3 font-mono">
                          ${expense.amount.toLocaleString()}
                        </td>
                        <td className="text-right p-3 font-mono">
                          {expense.percentage.toFixed(1)}%
                        </td>
                        <td className="text-right p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isHighImpact 
                              ? 'bg-[var(--danger)]/10 text-[var(--danger)]'
                              : isMediumImpact
                              ? 'bg-[var(--warn)]/10 text-[var(--warn)]'
                              : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                          }`}>
                            {isHighImpact ? 'Alto' : isMediumImpact ? 'Medio' : 'Bajo'}
                          </span>
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