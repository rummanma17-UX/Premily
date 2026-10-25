import React from "react";

export function DiscountBadge({ discount }: { discount: number }) {
  if (discount <= 0) return null;
  return (
    <span className="gbtn rounded-full px-2 py-0.5 text-[9px] font-bold tracking-tight shadow-xs">
      -{discount}%
    </span>
  );
}
