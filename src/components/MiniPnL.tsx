// Mini P&L Component
// Inline profit & loss summary after data entry

import { cn } from '@/lib/utils';
import { formatMXN, formatPct, type PnLData } from '@/lib/finance';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MiniPnLProps {
  data: PnLData;
  className?: string;
  showTitle?: boolean;
}

export default function MiniPnL({ 
  data, 
  className,
  showTitle = true 
}: MiniPnLProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-accent-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-warn-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getValueColor = (value: number, isPercentage: boolean = false) => {
    if (isPercentage) {
      // For percentages, lower is better for costs, higher is better for margins
      if (value > 15) return 'text-warn-600'; // High cost %
      if (value > 10) return 'text-warn-500'; // Medium cost %
      return 'text-accent-600'; // Good cost %
    }
    
    // For absolute values
    if (value > 0) return 'text-accent-600';
    if (value < 0) return 'text-warn-600';
    return 'text-gray-600';
  };

  const pnlItems = [
    {
      label: 'Ventas',
      value: data.sales,
      format: 'currency',
      icon: null,
      isMain: true,
    },
    {
      label: 'COGS',
      value: data.cogs,
      format: 'currency',
      percentage: data.foodCostPct,
      icon: getTrendIcon(-data.cogs),
    },
    {
      label: 'Utilidad Bruta',
      value: data.grossProfit,
      format: 'currency',
      percentage: ((data.grossProfit / data.sales) * 100),
      icon: getTrendIcon(data.grossProfit),
    },
    {
      label: 'OPEX Total',
      value: data.totalOpex,
      format: 'currency',
      percentage: ((data.totalOpex / data.sales) * 100),
      icon: getTrendIcon(-data.totalOpex),
    },
    {
      label: 'EBITDA',
      value: data.ebitda,
      format: 'currency',
      percentage: data.ebitdaPct,
      icon: getTrendIcon(data.ebitda),
      isMain: true,
    },
  ];

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden",
      className
    )}>
      {showTitle && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-body font-semibold text-navy-600">
            Resumen P&L
          </h3>
          <p className="text-caption text-gray-500">
            Cálculo automático basado en tus datos
          </p>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {pnlItems.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              item.isMain && "bg-accent-50/30"
            )}
          >
            {/* Label and Icon */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.icon}
              <span className={cn(
                "font-medium truncate",
                item.isMain 
                  ? "text-navy-700 text-body" 
                  : "text-gray-700 text-body"
              )}>
                {item.label}
              </span>
            </div>

            {/* Values */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Percentage */}
              {item.percentage !== undefined && (
                <span className={cn(
                  "text-caption font-medium min-w-[3rem] text-right",
                  getValueColor(item.percentage, true)
                )}>
                  {formatPct(item.percentage)}
                </span>
              )}
              
              {/* Currency Amount */}
              <span className={cn(
                "font-semibold min-w-[5rem] text-right",
                item.isMain 
                  ? "text-body text-navy-700" 
                  : "text-body",
                getValueColor(item.value)
              )}>
                {formatMXN(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-caption">
          <span className="text-gray-600">Food Cost:</span>
          <span className={cn(
            "font-semibold px-2 py-1 rounded-md",
            data.foodCostPct > 30 
              ? "bg-warn-100 text-warn-700"
              : data.foodCostPct > 25
              ? "bg-yellow-100 text-yellow-700"
              : "bg-accent-100 text-accent-700"
          )}>
            {formatPct(data.foodCostPct)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact version for inline display
export function MiniPnLCompact({ data, className }: { data: PnLData; className?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200",
      className
    )}>
      <div className="text-caption text-gray-600">
        EBITDA: <span className={cn(
          "font-semibold",
          getValueColor(data.ebitda)
        )}>{formatMXN(data.ebitda)}</span>
      </div>
      
      <div className="text-caption text-gray-600">
        Food Cost: <span className={cn(
          "font-semibold px-2 py-0.5 rounded",
          data.foodCostPct > 30 
            ? "bg-warn-100 text-warn-700"
            : "bg-accent-100 text-accent-700"
        )}>{formatPct(data.foodCostPct)}</span>
      </div>
    </div>
  );
}

function getValueColor(value: number): string {
  if (value > 0) return 'text-accent-600';
  if (value < 0) return 'text-warn-600';
  return 'text-gray-600';
}