import React from "react";

export default function AutoGrid({
  children,
  className = ""
}: {
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`grid gap-4 md:gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))] ${className}`}>
      {children}
    </div>
  );
}
