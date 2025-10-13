import React from "react";

export default function Segmented({
  items,
  active,
  onChange
}: {
  items: string[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="inline-flex rounded-[var(--radius-chip)] border border-white/10 p-1">
      {items.map((it, i) => (
        <button 
          key={it}
          onClick={() => onChange(i)}
          className={`px-3 py-1.5 text-sm rounded-[var(--radius-chip)] ${i === active ? "bg-white/10 shadow-[var(--shadow-sm)]" : "hover:bg-white/5"}`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}
