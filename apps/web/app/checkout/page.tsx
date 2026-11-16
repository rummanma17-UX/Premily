"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts";
import { apiFetch } from "@/lib/api";
import type { DistrictShippingInfo } from "@/types";
import type { ConfirmedOrder } from "@/types";
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Truck,
  RotateCcw,
  ShoppingBag,
  Store,
} from "lucide-react";
import { CartService } from "@/lib/cart-service";
import { MfsPaymentModal } from "@/components/checkout/MfsPaymentModal";
import { MartBadge } from "@/components/badges/MartBadge";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export default function CheckoutPage() {
  const [fullName, setFullName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("premily_user");
        if (stored) return JSON.parse(stored).name || "";
      } catch {
        // silent
      }
    }
    return "";
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("premily_user");
        if (stored) return JSON.parse(stored).phone || "";
      } catch {
        // silent
      }
    }
    return "";
  });
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [districts, setDistricts] = useState<Array<Pick<DistrictShippingInfo, "districtName" | "division">>>([]);
  const [districtLoadError, setDistrictLoadError] = useState<string | null>(null);
  const [cityThana, setCityThana] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "BKASH" | "NAGAD">("BKASH");

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<ConfirmedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Cart and Multi-Store Grouping (AGENT.md Rule 5)
  const [, setCartVersion] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const [shippingQuote, setShippingQuote] = useState<{ totalShippingCost: number; stores: Array<{storeId:string;shippingCost:number}> } | null>(null);
  const [shippingQuoteError, setShippingQuoteError] = useState<string | null>(null);
  const [mfsModalOpen, setMfsModalOpen] = useState(false);

  useEffect(() => {
    const handleCartUpdate = () => setCartVersion((version) => version + 1);
    window.addEventListener("premily_cart_change", handleCartUpdate);
    void CartService.loadCart().catch((error) => setErrorMessage(error instanceof Error ? error.message : "Unable to load your cart.")).finally(() => setCartLoading(false));
    const savedDistrict = localStorage.getItem("premily_delivery_district");
    if (savedDistrict) setSelectedDistrict(savedDistrict);
    return () => window.removeEventListener("premily_cart_change", handleCartUpdate);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch<DistrictShippingInfo[]>("/api/shipping/districts")
      .then((records) => {
        if (cancelled) return;
        setDistricts(records.map(({ districtName, division }) => ({ districtName, division })));
        setDistrictLoadError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setDistricts(BANGLADESH_DISTRICTS.map(({ name, division }) => ({ districtName: name, division })));
        setDistrictLoadError("Live district data is unavailable. Showing the standard district list.");
      });
    return () => { cancelled = true; };
  }, []);

  const cartSummary = CartService.getStoreGroups(selectedDistrict);
  const groups = cartSummary.groups;
  const totalSubtotal = cartSummary.totalSubtotal;
  const totalShipping = shippingQuote?.totalShippingCost ?? 0;
  const grandTotal = totalSubtotal + totalShipping;
  useEffect(() => {
    let cancelled = false;
    if (!groups.length) { setShippingQuote({ totalShippingCost: 0, stores: [] }); return; }
    apiFetch<{ totalShippingCost: number; stores: Array<{storeId:string;shippingCost:number}> }>("/api/shipping/calculate", {
      method: "POST",
      body: JSON.stringify({ destinationDistrict: selectedDistrict, storeIds: groups.map((group) => group.storeId) }),
    }).then((quote) => {
      if (!cancelled) { setShippingQuote(quote); setShippingQuoteError(null); }
    }).catch((error) => {
      if (!cancelled) {
        setShippingQuote(null);
        setShippingQuoteError(error instanceof Error ? error.message : "Unable to calculate delivery fees.");
      }
    });
    return () => { cancelled = true; };
  }, [selectedDistrict, groups.map((group) => group.storeId).join(",")]);

  const isDhaka = selectedDistrict.toLowerCase() === "dhaka";

  const executeOrderPlacement = async (trxId: string | null = null, senderNumber: string | null = null) => {
    setIsPlacing(true);
    setErrorMessage(null);
    try {
      const order = await apiFetch<any>("/api/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          shippingName: fullName.trim(),
          shippingPhone: phoneNumber.trim(),
          shippingAddress: streetAddress.trim(),
          shippingCity: cityThana.trim() || selectedDistrict,
          shippingDistrict: selectedDistrict,
          paymentMethod,
        }),
      });
      const createdOrders = Array.isArray(order) ? order : [order];
      if (trxId && createdOrders[0]?.id) {
        await apiFetch(`/api/orders/${createdOrders[0].id}/payment-proof`, {
          method: "POST",
          body: JSON.stringify({ transactionId: trxId, senderNumber }),
        });
      }
      const first = createdOrders[0];
      if (!first?.orderNumber) throw new Error("The server did not return a valid order confirmation.");
      await CartService.loadCart();
      setOrderConfirmed({
        orderNumber: first.orderNumber,
        total: createdOrders.reduce((sum, item) => sum + Number(item.total ?? 0), 0),
        shippingDistrict: selectedDistrict,
        paymentMethod,
        shippingAddress: streetAddress,
      });
      setMfsModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Order could not be placed. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Bangladeshi phone validation (AGENT.md Rule 4)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setErrorMessage("Please enter a valid 11-digit Bangladeshi phone number (e.g. 01712345678).");
      return;
    }

    if (!streetAddress.trim()) {
      setErrorMessage("Please enter your detailed delivery address.");
      return;
    }

    if (!shippingQuote || shippingQuoteError) {
      setErrorMessage("Delivery fees are not available yet. Please wait for the shipping quote and try again.");
      return;
    }

    if (groups.length === 0 || groups.every((g) => g.items.length === 0)) {
      setErrorMessage("Your cart is empty. Please add items to your cart before checking out.");
      return;
    }

    // If MFS payment is chosen, trigger the automated direct gateway modal
    if (paymentMethod === "BKASH" || paymentMethod === "NAGAD") {
      setMfsModalOpen(true);
      return;
    }

    // Otherwise Cash on Delivery
    void executeOrderPlacement();
  };

  if (orderConfirmed) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 grid place-items-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark">
            Order Confirmed!
          </h1>
          <p className="text-sm text-muted">
            Thank you, <b className="text-dark">{fullName || "Customer"}</b>! Your order has been placed.
          </p>
        </div>

        <div className="premily-card p-6 rounded-2xl border border-border-gold bg-white shadow-xs text-xs space-y-3 text-left">
          <div className="flex justify-between border-b border-border-gold/30 pb-2.5">
            <span className="text-muted">Order Reference:</span>
            <span className="font-mono font-bold text-dark">{orderConfirmed.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-border-gold/30 pb-2.5">
            <span className="text-muted">Destination:</span>
            <span className="font-semibold text-dark">{selectedDistrict} ({isDhaka ? "1-2 Days" : "3-5 Days"})</span>
          </div>
          <div className="flex justify-between border-b border-border-gold/30 pb-2.5">
            <span className="text-muted">Payment:</span>
            <span className="font-semibold text-deep">{paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold text-dark">
            <span>Total Payable:</span>
            <span className="text-deep font-serif text-base">{formatTaka(orderConfirmed.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/account/orders"
            className="gbtn px-6 py-3 rounded-full text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Track in My Orders</span>
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-xs font-semibold border border-border-gold text-dark hover:border-deep bg-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link href="/products" className="text-xs text-muted hover:text-dark flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Catalog
        </Link>
        <span className="text-xs text-muted font-medium flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          PREMILY Secure Checkout
        </span>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left Column: Delivery Details & Payment Choice */}
        <div className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Shipping Address Card */}
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4">
            <h2 className="font-bold text-sm sm:text-base border-b border-border-gold/40 pb-3 flex items-center gap-2 text-dark">
              <MapPin className="w-4 h-4 text-deep" />
              1. Delivery Address (Nationwide Bangladesh)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Abdullah Al Rumman"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-gold bg-cream/50 text-dark outline-none focus:border-deep transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted">Phone Number (11-digit BD) *</label>
                <input
                  required
                  type="tel"
                  placeholder="01712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-gold bg-cream/50 text-dark outline-none focus:border-deep transition"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-muted">Street Address (House, Road, Area) *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. House #14, Road #4, Dhanmondi"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-gold bg-cream/50 text-dark outline-none focus:border-deep transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted">District (64 Districts) *</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    localStorage.setItem("premily_delivery_district", e.target.value);
                    window.dispatchEvent(new Event("premily_delivery_change"));
                  }}
                  disabled={districts.length === 0}
                  required
                  className="w-full appearance-auto px-3.5 py-2.5 rounded-xl border border-border-gold bg-cream/50 text-dark outline-none focus:border-deep transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="" disabled>Select your delivery district</option>
                  {districts.map((district) => (
                    <option key={district.districtName} value={district.districtName}>
                      {district.districtName} ({district.division})
                    </option>
                  ))}
                </select>
                {districtLoadError && <p className="text-[10px] text-amber-700">{districtLoadError}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted">City / Thana / Upazila *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dhanmondi / Sadar"
                  value={cityThana}
                  onChange={(e) => setCityThana(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-gold bg-cream/50 text-dark outline-none focus:border-deep transition"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection Card */}
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4">
            <h2 className="font-bold text-sm sm:text-base border-b border-border-gold/40 pb-3 flex items-center gap-2 text-dark">
              <CreditCard className="w-4 h-4 text-deep" />
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* bKash */}
              <label
                onClick={() => setPaymentMethod("BKASH")}
                className={`p-4 rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer border-2 transition ${
                  paymentMethod === "BKASH"
                    ? "border-deep bg-cream/70 shadow-xs"
                    : "border-border-gold bg-white hover:bg-cream/20"
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold grid place-items-center text-xs">
                  bK
                </span>
                <b className="text-dark">bKash</b>
                <span className="text-[10px] text-muted">Direct Mobile Payment</span>
              </label>

              {/* Nagad */}
              <label
                onClick={() => setPaymentMethod("NAGAD")}
                className={`p-4 rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer border-2 transition ${
                  paymentMethod === "NAGAD"
                    ? "border-deep bg-cream/70 shadow-xs"
                    : "border-border-gold bg-white hover:bg-cream/20"
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold grid place-items-center text-xs">
                  Ng
                </span>
                <b className="text-dark">Nagad</b>
                <span className="text-[10px] text-muted">Post Office Wallet</span>
              </label>

              {/* Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`p-4 rounded-xl flex flex-col items-center text-center gap-1.5 cursor-pointer border-2 transition ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-deep bg-cream/70 shadow-xs"
                    : "border-border-gold bg-white hover:bg-cream/20"
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold grid place-items-center text-xs">
                  COD
                </span>
                <b className="text-dark">Cash on Delivery</b>
                <span className="text-[10px] text-muted">Pay upon doorstep receipt</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4 sticky top-6">
          <h2 className="font-serif text-base font-bold text-dark border-b border-border-gold/40 pb-3">
            Order Summary
          </h2>

          {/* Itemized List Grouped by Store (AGENT.md Rule 5) */}
          <div className="space-y-4 border-b border-border-gold/30 pb-3 text-xs">
            {groups.length === 0 || groups.every((g) => g.items.length === 0) ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-muted">Your cart is currently empty.</p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/products";
                  }}
                  className="px-4 py-2 rounded-xl gbtn text-xs font-semibold cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.storeId} className="rounded-xl border border-border-gold/50 bg-cream/30 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-dark pb-1 border-b border-border-gold/30">
                    <span className="flex items-center gap-1 truncate">
                      <Store className="w-3 h-3 text-deep" />
                      {group.storeName}
                      {group.isPremilyMart && <MartBadge size="sm" />}
                    </span>
                    <span className="text-muted font-normal text-[10px]">
                      Ship: {formatTaka(group.shippingCost)}
                    </span>
                  </div>

                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-2.5 items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border-gold shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-dark truncate text-xs">{item.name}</h4>
                        <p className="text-[10px] text-muted">{item.variantLabel} • Qty {item.quantity}</p>
                      </div>
                      <span className="font-bold text-deep shrink-0 text-xs">
                        {formatTaka(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <b className="text-dark">{formatTaka(totalSubtotal)}</b>
            </div>

            <div className="flex justify-between items-center">
              <span>Delivery Fee ({selectedDistrict} • {groups.length} {groups.length > 1 ? "Stores" : "Store"})</span>
              <b className="text-dark">{shippingQuoteError ? "Unavailable" : formatTaka(totalShipping)}</b>
            </div>

            {shippingQuoteError && <p role="alert" className="text-[11px] text-rose-700">{shippingQuoteError}</p>}
            {!shippingQuote && !shippingQuoteError && groups.length > 0 && <p className="text-[11px] text-muted">Calculating delivery fees…</p>}
            <div className="text-[11px] text-muted italic flex items-center gap-1">
              <Truck className="w-3 h-3 text-deep" />
              <span>Est. Arrival: {isDhaka ? "1-2 Business Days" : "3-5 Business Days"}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-dark border-t border-border-gold/30 pt-3">
              <span>Total Payable</span>
              <span className="text-deep font-serif text-lg">{formatTaka(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPlacing || grandTotal === 0 || !shippingQuote || !!shippingQuoteError}
            className="gbtn w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer transition-all hover:brightness-105 disabled:opacity-50"
          >
            {isPlacing
              ? "Processing Order..."
              : paymentMethod === "CASH_ON_DELIVERY"
              ? `Confirm Order • ${formatTaka(grandTotal)}`
              : `Pay via ${paymentMethod === "BKASH" ? "bKash" : "Nagad"} • ${formatTaka(grandTotal)}`}
          </button>

          <div className="pt-2 border-t border-border-gold/20 space-y-1.5 text-[10px] text-muted">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Guaranteed authentic from authorized seller</span>
            </div>
            <div className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-deep" />
              <span>7-Day Return and Exchange policy</span>
            </div>
          </div>
        </aside>
      </form>

      {/* Automated MFS Payment Gateway Modal (bKash & Nagad) */}
      <MfsPaymentModal
        isOpen={mfsModalOpen}
        onClose={() => setMfsModalOpen(false)}
        gateway={paymentMethod === "NAGAD" ? "NAGAD" : "BKASH"}
        amount={grandTotal}
        customerPhone={phoneNumber}
        storeName={groups[0]?.storeName || "PREMILY Verified Stores"}
        onSuccess={(trxId, senderNumber) => void executeOrderPlacement(trxId, senderNumber)}
      />

    </main>
  );
}
