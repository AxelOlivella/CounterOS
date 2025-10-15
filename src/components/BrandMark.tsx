import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandMark({ to = "/", className, size = "md" }: BrandMarkProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  const content = (
    <span className={cn("font-bold tracking-tight", sizeClasses[size], className)}>
      CounterOS
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
