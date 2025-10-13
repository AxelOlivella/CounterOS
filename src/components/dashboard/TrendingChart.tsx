import { cn } from "@/lib/utils";

interface TrendingDataPoint {
  week: number;
  fc: number;
}

interface TrendingChartProps {
  data: TrendingDataPoint[];
  target: number;
  title: string;
  message?: string;
  className?: string;
}

export function TrendingChart({
  data,
  target,
  title,
  message,
  className,
}: TrendingChartProps) {
  // Calculate chart dimensions and scaling
  const minFC = 24;
  const maxFC = 38;
  const range = maxFC - minFC;
  
  const getY = (fc: number) => ((maxFC - fc) * 250) / range;
  const targetY = getY(target);

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-6", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

      {/* Chart */}
      <div className="relative" style={{ height: "250px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 250"
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[24, 26, 28, 30, 32, 34, 36, 38].map((val) => (
            <g key={val}>
              <line
                x1="40"
                y1={getY(val)}
                x2="800"
                y2={getY(val)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x="35"
                y={getY(val)}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {val}%
              </text>
            </g>
          ))}

          {/* Target line */}
          <line
            x1="40"
            y1={targetY}
            x2="800"
            y2={targetY}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <text
            x="805"
            y={targetY}
            fontSize="12"
            fill="#ef4444"
            fontWeight="600"
            dominantBaseline="middle"
          >
            Meta
          </text>

          {/* Data line */}
          <polyline
            points={data
              .map((d, i) => {
                const x = 40 + ((i / (data.length - 1)) * 760);
                const y = getY(d.fc);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = 40 + ((i / (data.length - 1)) * 760);
            const y = getY(d.fc);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-8 cursor-pointer transition-all"
                />
                <title>
                  Semana {d.week}: {d.fc.toFixed(1)}%
                </title>
              </g>
            );
          })}

          {/* Week labels */}
          {data.filter((_, i) => i % 2 === 0).map((d, i) => {
            const originalIndex = i * 2;
            const x = 40 + ((originalIndex / (data.length - 1)) * 760);
            return (
              <text
                key={d.week}
                x={x}
                y="265"
                fontSize="11"
                fill="#6b7280"
                textAnchor="middle"
              >
                S{d.week}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Insight message */}
      {message && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Insight:</strong> {message}
          </p>
        </div>
      )}
    </div>
  );
}
