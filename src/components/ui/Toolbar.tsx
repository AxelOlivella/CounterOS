import React from "react";

export default function Toolbar({
  left,
  right
}: {
  left?: React.ReactNode; 
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {left}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {right}
      </div>
    </div>
  );
}
