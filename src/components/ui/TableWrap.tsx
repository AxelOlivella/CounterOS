import React from "react";

export default function TableWrap({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--card-border)] shadow-[var(--shadow-sm)]">
      <div className="min-w-[720px] table--base">
        {children}
      </div>
    </div>
  );
}
