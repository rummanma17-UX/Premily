import React from "react";
import { CheckCircle2 } from "lucide-react";

export function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";
  return (
    <span
      title="Verified PREMILY Seller"
      className={`inline-flex items-center gap-1 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 ${
        isSm ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      <CheckCircle2 className={isSm ? "w-2.5 h-2.5 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
      <span>Verified</span>
    </span>
  );
}
