import React from "react";
import { Star } from "lucide-react";

export function RatingStars({
  rating,
  size = "sm",
  showNumber = false,
  reviewCount,
}: {
  rating: number;
  size?: "xs" | "sm" | "md";
  showNumber?: boolean;
  reviewCount?: number;
}) {
  const iconSize = size === "xs" ? "w-2.5 h-2.5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "xs" ? "text-[10px]" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="inline-flex items-center gap-1 text-gold">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? "fill-current text-deep"
                : "text-border-gold fill-surface-subtle"
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className={`font-semibold text-dark ${textSize}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-muted ${textSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
