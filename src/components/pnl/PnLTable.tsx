import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

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

interface PnLTableProps {
  data: PnLData;
}

export const PnLTable = ({ data }: PnLTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getMarginBadge = (margin: number, type: 'gross' | 'net') => {
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    
    if (type === 'gross') {
      variant = margin > 60 ? 'default' : margin > 50 ? 'secondary' : 'destructive';
    } else {
      variant = margin > 20 ? 'default' : margin > 10 ? 'secondary' : 'destructive';
    }
    
    return (
      <Badge variant={variant} className="ml-2">
        {formatPercentage(margin)}
      </Badge>
    );
  };

  const rows = [
    {
      label: 'Ingresos por Ventas',
      amount: data.revenue,
      percentage: 100,
      isHeader: false,
      indent: 0
    },
    {
      label: 'Costo de Ventas',
      amount: -data.cogs,
      percentage: data.revenue > 0 ? (data.cogs / data.revenue) * 100 : 0,
      isHeader: false,
      indent: 0
    },
    {
      label: 'Utilidad Bruta',
      amount: data.grossProfit,
      percentage: data.grossMargin,
      isHeader: true,
      indent: 0,
      badge: getMarginBadge(data.grossMargin, 'gross')
    },
    {
      label: 'Gastos Operativos',
      amount: 0,
      percentage: 0,
      isHeader: true,
      indent: 0
    },
    {
      label: 'Gastos de Nómina',
      amount: -data.laborCosts,
      percentage: data.revenue > 0 ? (data.laborCosts / data.revenue) * 100 : 0,
      isHeader: false,
      indent: 1
    },
    {
      label: 'Otros Gastos Operativos',
      amount: -data.otherExpenses,
      percentage: data.revenue > 0 ? (data.otherExpenses / data.revenue) * 100 : 0,
      isHeader: false,
      indent: 1
    },
    {
      label: 'Total Gastos Operativos',
      amount: -data.totalOperatingExpenses,
      percentage: data.revenue > 0 ? (data.totalOperatingExpenses / data.revenue) * 100 : 0,
      isHeader: false,
      indent: 0
    },
    {
      label: 'EBITDA',
      amount: data.ebitda,
      percentage: data.ebitdaMargin,
      isHeader: true,
      indent: 0
    },
    {
      label: 'Utilidad Neta',
      amount: data.netProfit,
      percentage: data.netMargin,
      isHeader: true,
      indent: 0,
      badge: getMarginBadge(data.netMargin, 'net')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Estado de Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg font-medium text-sm">
            <div>Concepto</div>
            <div className="text-right">Monto</div>
            <div className="text-right">% Ventas</div>
          </div>

          {/* Rows */}
          {rows.map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 gap-4 p-3 rounded-lg border-b border-border/50 ${
                row.isHeader 
                  ? 'bg-muted/30 font-semibold' 
                  : 'hover:bg-muted/20'
              }`}
            >
              <div className={`flex items-center ${row.indent > 0 ? 'pl-6' : ''}`}>
                {row.indent > 0 && (
                  <span className="text-muted-foreground mr-2">→</span>
                )}
                <span className={row.isHeader ? 'font-semibold' : ''}>
                  {row.label}
                </span>
                {row.badge}
              </div>
              <div className={`text-right ${
                row.amount > 0 ? 'text-foreground' : 'text-red-600'
              } ${row.isHeader ? 'font-semibold' : ''}`}>
                {row.amount !== 0 && formatCurrency(Math.abs(row.amount))}
              </div>
              <div className={`text-right text-muted-foreground ${
                row.isHeader ? 'font-semibold text-foreground' : ''
              }`}>
                {row.percentage > 0 && formatPercentage(row.percentage)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">Indicadores Clave</div>
              <div className="space-y-1 text-muted-foreground">
                <div>Margen Bruto: {formatPercentage(data.grossMargin)}</div>
                <div>Margen EBITDA: {formatPercentage(data.ebitdaMargin)}</div>
                <div>Margen Neto: {formatPercentage(data.netMargin)}</div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Estructura de Costos</div>
              <div className="space-y-1 text-muted-foreground">
                <div>COGS: {formatPercentage(data.revenue > 0 ? (data.cogs / data.revenue) * 100 : 0)}</div>
                <div>Nómina: {formatPercentage(data.revenue > 0 ? (data.laborCosts / data.revenue) * 100 : 0)}</div>
                <div>Otros: {formatPercentage(data.revenue > 0 ? (data.otherExpenses / data.revenue) * 100 : 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};