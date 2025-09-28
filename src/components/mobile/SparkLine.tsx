import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DataPoint {
  value: number;
  label: string;
  date?: string;
}

interface SparkLineProps {
  data: DataPoint[];
  targetValue?: number;
  className?: string;
  showTooltip?: boolean;
  height?: number;
}

export function SparkLine({
  data,
  targetValue,
  className,
  showTooltip = true,
  height = 60
}: SparkLineProps) {
  const { points, maxValue, minValue, targetLine } = useMemo(() => {
    if (data.length === 0) return { points: '', maxValue: 0, minValue: 0, targetLine: '' };

    const values = data.map(d => d.value);
    const max = Math.max(...values, targetValue || 0);
    const min = Math.min(...values, targetValue || 0);
    const range = max - min || 1;
    
    const width = 200;
    const padding = 10;
    const effectiveWidth = width - (padding * 2);
    const effectiveHeight = height - (padding * 2);

    // Generate SVG path for the line
    const pathData = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * effectiveWidth;
      const y = padding + ((max - point.value) / range) * effectiveHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Target line if provided
    let targetLineData = '';
    if (targetValue !== undefined) {
      const targetY = padding + ((max - targetValue) / range) * effectiveHeight;
      targetLineData = `M ${padding} ${targetY} L ${width - padding} ${targetY}`;
    }

    return {
      points: pathData,
      maxValue: max,
      minValue: min,
      targetLine: targetLineData
    };
  }, [data, targetValue, height]);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-xs text-muted-foreground', className)}>
        Sin datos disponibles
      </div>
    );
  }

  const lastValue = data[data.length - 1]?.value || 0;
  const isAboveTarget = targetValue ? lastValue > targetValue : false;

  return (
    <div className={cn('relative', className)}>
      <svg
        width="100%"
        height={height}
        viewBox="0 0 200 60"
        className="overflow-visible"
      >
        {/* Target line */}
        {targetValue && targetLine && (
          <path
            d={targetLine}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeDasharray="2,2"
            fill="none"
            opacity="0.5"
          />
        )}
        
        {/* Main line */}
        <path
          d={points}
          stroke={isAboveTarget ? 'hsl(var(--danger))' : 'hsl(var(--success))'}
          strokeWidth="2"
          fill="none"
          className="transition-colors"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = 10 + (index / (data.length - 1)) * 180;
          const y = 10 + ((maxValue - point.value) / (maxValue - minValue || 1)) * 40;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={point.value > (targetValue || 0) ? 'hsl(var(--danger))' : 'hsl(var(--success))'}
              className="hover:r-3 transition-all cursor-pointer"
            >
              {showTooltip && (
                <title>{`${point.label}: ${point.value}${targetValue ? ` (Meta: ${targetValue})` : ''}`}</title>
              )}
            </circle>
          );
        })}
      </svg>
      
      {/* Current value indicator */}
      <div className="absolute top-0 right-0 text-xs font-medium">
        <span className={cn(
          'px-2 py-1 rounded-full',
          isAboveTarget ? 'status-over-budget' : 'status-saving'
        )}>
          {lastValue.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}