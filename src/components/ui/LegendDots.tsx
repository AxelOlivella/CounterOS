import React from "react";

export default function LegendDots({
  items
}: {
  items: {
    label: string;
    color: string;
    active?: boolean;
    onToggle?: () => void;
  }[]
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((it) => (
        <button 
          key={it.label} 
          onClick={it.onToggle}
          className={`inline-flex items-center gap-2 rounded-[var(--radius-chip)] border px-2.5 py-1 text-xs ${it.active === false ? "opacity-50" : ""}`}
          style={{borderColor: it.color, color: it.color}}
        >
          <span 
            className="h-1.5 w-1.5 rounded-full" 
            style={{background: it.color}}
          />
          {it.label}
        </button>
      ))}
    </div>
  );
}
