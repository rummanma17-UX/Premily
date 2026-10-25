"use client";

import React, { useState } from "react";
import type { ProductImage } from "@/types";

export function ImageGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentImage = images[selectedIndex]?.url ?? "/placeholder-product.jpg";

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="premily-card overflow-hidden bg-white aspect-square w-full rounded-2xl border border-border-gold shadow-xs relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={images[selectedIndex]?.altText ?? productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "border-deep ring-2 ring-gold/40 shadow-xs scale-102"
                  : "border-border-gold/60 opacity-75 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? `${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
