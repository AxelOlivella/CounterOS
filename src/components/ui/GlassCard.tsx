import React from "react";

export default function GlassCard({
  children, 
  className = ""
}: {
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md shadow-[var(--shadow-sm)] ${className}`}>
      {children}
    </div>
  );
}
