import { cn } from "@/lib/utils";
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  status: "success" | "warning" | "critical" | "neutral";
  subtitle?: string;
  className?: string;
}

const statusConfig = {
  success: {
    borderColor: "border-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    icon: TrendingUp,
  },
  warning: {
    borderColor: "border-yellow-500",
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    icon: AlertCircle,
  },
  critical: {
    borderColor: "border-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50",
    icon: TrendingDown,
  },
  neutral: {
    borderColor: "border-gray-400",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: Minus,
  },
};

export function StatCard({
  title,
  value,
  delta,
  status,
  subtitle,
  className,
}: StatCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200",
        "animate-fade-in",
        config.borderColor,
        className
      )}
    >
      {/* Title */}
      <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>

      {/* Value */}
      <div className="text-4xl font-bold text-gray-900 mb-2 tabular-nums">
        {value}
      </div>

      {/* Delta */}
      {delta && (
        <div className={cn("flex items-center gap-1 text-base mb-1", config.textColor)}>
          <StatusIcon className="h-4 w-4" />
          <span className="font-medium">{delta}</span>
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
