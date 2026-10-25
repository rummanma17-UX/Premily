"use client";

import React, { useState } from "react";
import { MapPin, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts";
import type { StoreSummary } from "@/types";

export function DeliveryEstimator({ store }: { store: StoreSummary }) {
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [isChanging, setIsChanging] = useState(false);

  const homeDistrict = store.homeDistrict?.trim().toLowerCase() ?? "dhaka";
  const isLocal = selectedDistrict.toLowerCase() === homeDistrict;

  const cost = isLocal ? 70 : 150;
  const deliveryTime = isLocal ? "1 - 2 Business Days" : "3 - 5 Business Days";

  return (
    <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white shadow-xs space-y-3 text-xs sm:text-sm">
      <div className="flex items-center justify-between border-b border-border-gold/40 pb-2.5">
        <span className="font-semibold text-dark flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-deep" />
          Delivery Information
        </span>
        <button
          type="button"
          onClick={() => setIsChanging(!isChanging)}
          className="text-xs font-semibold text-deep hover:underline cursor-pointer"
        >
          {isChanging ? "Done" : "Change District"}
        </button>
      </div>

      {isChanging ? (
        <div className="space-y-1.5 py-1">
          <label className="text-[11px] font-medium text-muted">Select Destination District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setIsChanging(false);
            }}
            className="w-full px-3 py-1.5 rounded-lg border border-border-gold bg-cream text-dark text-xs outline-none focus:border-deep"
          >
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.division})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-dark">
          <MapPin className="w-3.5 h-3.5 text-deep" />
          <span>Deliver to:</span>
          <b className="font-semibold">{selectedDistrict}</b>
          <span className="text-muted ml-auto">({deliveryTime})</span>
        </div>
      )}

      <div className="flex justify-between items-center text-xs py-1 border-t border-border-gold/30">
        <span className="text-muted">Standard Shipping Fee:</span>
        <span className="font-bold text-deep">৳{cost}</span>
      </div>

      <div className="space-y-1.5 pt-1 text-[11px] text-muted border-t border-border-gold/30">
        <div className="flex items-center gap-1.5 text-dark">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cash on Delivery Available</span>
        </div>
        <div className="flex items-center gap-1.5 text-dark">
          <RotateCcw className="w-3.5 h-3.5 text-deep" />
          <span>7-Day Return & Replacement Policy</span>
        </div>
      </div>
    </div>
  );
}
