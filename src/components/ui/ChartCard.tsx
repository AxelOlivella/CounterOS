import React from "react";
import GlassCard from "./GlassCard";

export default function ChartCard({
  title,
  action,
  children
}: {
  title?: string; 
  action?: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <GlassCard>
      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          {title ? (
            <h3 className="text-sm font-medium text-zinc-300">
              {title}
            </h3>
          ) : (
            <div />
          )}
          {action}
        </div>
        <div className="h-[240px] md:h-[300px]">
          {children}
        </div>
      </div>
    </GlassCard>
  );
}
