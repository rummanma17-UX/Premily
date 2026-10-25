import React from "react";
import { ShieldCheck } from "lucide-react";

export function MartBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";
  return (
    <span
      title="Official PREMILY Mart Partner"
      className={`inline-flex items-center gap-1 rounded font-semibold tracking-wider bg-dark text-light-gold border border-gold/40 shadow-xs ${
        isSm ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <ShieldCheck className={isSm ? "w-2.5 h-2.5 text-gold" : "w-3.5 h-3.5 text-gold"} />
      <span>MART</span>
    </span>
  );
}
