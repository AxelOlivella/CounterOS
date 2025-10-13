import React from "react";

export default function Pill({
  tone = "neutral",
  children
}: {
  tone?: "neutral" | "accent" | "warn" | "danger";
  children: React.ReactNode;
}) {
  const map = {
    neutral: "border-white/15 text-zinc-300",
    accent:  "border-[var(--accent)]/40 text-[var(--accent)]",
    warn:    "border-[var(--warn)]/40 text-[var(--warn)]",
    danger:  "border-[var(--danger)]/40 text-[var(--danger)]",
  } as const;
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] border px-3 py-1 text-xs ${map[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
