import React from "react";

export default function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({length: 4}).map((_, i) => (
        <div 
          key={i} 
          className="rounded-[var(--radius-card)] border border-[var(--card-border)] p-4"
        >
          <div className="h-3 w-24 animate-pulse rounded bg-white/10 mb-3" />
          <div className="h-7 w-20 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
