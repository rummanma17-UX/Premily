"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  TrendingUp,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ShoppingBag,
  Search,
  AlertTriangle,
  RotateCcw,
  Tag,
  Check,
} from "lucide-react";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts";
import {
  StoreService,
  type StoreRecord,
  type OrderRecord,
  type CampaignRecord,
} from "@/lib/store-data";
import { MartBadge } from "@/components/badges/MartBadge";
import { VerifiedBadge } from "@/components/badges/VerifiedBadge";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<
    "vendors" | "verifications" | "orders" | "logistics" | "campaigns" | "metrics"
  >("vendors");

  const [stores, setStores] = useState<StoreRecord[]>(() => StoreService.getStores());
  const [orders, setOrders] = useState<OrderRecord[]>(() => StoreService.getOrders());
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() => StoreService.getCampaigns());
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState<"ALL" | "MART" | "VERIFIED" | "PENDING">("ALL");

  // Selected store for verification review modal
  const [reviewStore, setReviewStore] = useState<StoreRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Mart Badge Confirmation Modal (AGENT.md Rule 2: Strict Mart Governance)
  const [martTargetStore, setMartTargetStore] = useState<StoreRecord | null>(null);

  // Status message banner
  const [adminBanner, setAdminBanner] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setStores(StoreService.getStores());
      setOrders(StoreService.getOrders());
      setCampaigns(StoreService.getCampaigns());
    };

    window.addEventListener("premily_data_change", handleUpdate);
    return () => {
      window.removeEventListener("premily_data_change", handleUpdate);
    };
  }, []);

  const notify = (msg: string) => {
    setAdminBanner(msg);
    setTimeout(() => setAdminBanner(null), 3000);
  };

  // Rule 2: Strict Mart Badge Toggling
  const handleConfirmMartToggle = () => {
    if (!martTargetStore) return;
    const nextStatus = !martTargetStore.isPremilyMart;
    StoreService.updateStore({
      id: martTargetStore.id,
      isPremilyMart: nextStatus,
    });
    setMartTargetStore(null);
    notify(
      nextStatus
        ? `Official PREMILY Mart Partner status granted to ${martTargetStore.displayName}.`
        : `Mart badge revoked from ${martTargetStore.displayName}.`
    );
  };

  // Rule 3: Seller Verification Approval / Rejection
  const handleApproveVerification = (storeId: string) => {
    StoreService.updateStore({
      id: storeId,
      verificationStatus: "VERIFIED",
      verificationNote: "Verified and approved by PREMILY Superadmin.",
    });
    setReviewStore(null);
    notify("Seller Trade License & NID approved as VERIFIED.");
  };

  const handleRejectVerification = (storeId: string) => {
    StoreService.updateStore({
      id: storeId,
      verificationStatus: "REJECTED",
      verificationNote: rejectionReason || "Document verification rejected. Please resubmit valid trade license.",
    });
    setReviewStore(null);
    setRejectionReason("");
    notify("Seller verification marked as REJECTED.");
  };

  // Payment Verification for bKash / Nagad
  const handleVerifyPayment = (orderId: string) => {
    StoreService.verifyOrderPayment(orderId, "VERIFIED");
    notify("MFS Transaction ID verified successfully!");
  };

  // Toggle Campaign
  const handleToggleCampaign = (id: string) => {
    StoreService.toggleCampaign(id);
  };

  // Reset to seed data
  const handleResetData = () => {
    if (confirm("Reset all PREMILY demo data back to architectural default state?")) {
      StoreService.resetToDefaults();
      notify("Platform data restored to default seed state.");
    }
  };

  // Filtered stores
  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (vendorFilter === "MART") return s.isPremilyMart;
    if (vendorFilter === "VERIFIED") return s.verificationStatus === "VERIFIED";
    if (vendorFilter === "PENDING") return s.verificationStatus === "PENDING";
    return true;
  });

  const pendingVerificationCount = stores.filter((s) => s.verificationStatus === "PENDING").length;
  const martPartnerCount = stores.filter((s) => s.isPremilyMart).length;
  const totalPlatformGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSubscriptionMRR = stores.filter((s) => s.subscription.status === "ACTIVE").length * 150;

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Superadmin Sidebar */}
      <aside className="w-full lg:w-68 bg-dark text-cream border-r border-gold/30 shrink-0 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gold/20 bg-dark/80">
          <Link
            href="/"
            className="text-xs text-gold/80 hover:text-gold flex items-center gap-1 mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketplace Home
          </Link>
          <div className="font-serif text-lg font-bold tracking-wider text-cream flex items-center gap-1.5">
            PREMILY <span className="text-gold">Admin</span>
          </div>
          <span className="text-[10px] text-light-gold block">
            Central Governance & Logistics Authority
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-3 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("vendors")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "vendors"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/80 hover:text-cream hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>Vendors & Mart Badges</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gold font-bold">
              {stores.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verifications")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "verifications"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/80 hover:text-cream hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span>License Verifications</span>
            </div>
            {pendingVerificationCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-dark font-bold">
                {pendingVerificationCount} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/80 hover:text-cream hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>All Platform Orders</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gold font-bold">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logistics")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "logistics"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/80 hover:text-cream hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4" />
              <span>64-District Base Rates</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/80 hover:text-cream hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4" />
              <span>Promotional Campaigns</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("metrics")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "metrics"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/80 hover:text-cream hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>Platform Revenue & MRR</span>
            </div>
          </button>
        </nav>

        {/* Footer info & Reset */}
        <div className="mt-auto p-4 border-t border-gold/20 bg-dark/60 space-y-2">
          <div className="text-[11px] text-cream/70 space-y-1">
            <div>Seller Plan: <b>৳150/mo</b></div>
            <div>MRR: <b className="text-light-gold">{formatTaka(totalSubscriptionMRR)}/mo</b></div>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gold/30 text-[10px] text-light-gold hover:bg-white/5 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Store Data</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6">
        {/* Banner notification */}
        {adminBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 font-medium shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminBanner}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-gold/50 pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-dark">
              PREMILY Superadmin Command Center
            </h1>
            <p className="text-xs text-muted">
              Strict governance of PREMILY Mart partners, seller verification, and Bangladesh nationwide logistics.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Platform Live
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white border border-border-gold text-dark font-semibold">
              64 Districts Active
            </span>
          </div>
        </div>

        {/* TAB 1: VENDORS & MART BADGE STRICTNESS (AGENT.MD RULE 2) */}
        {activeTab === "vendors" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            {/* Rule 2 Notice Callout */}
            <div className="p-4 rounded-2xl bg-dark text-cream border border-gold/40 flex items-start gap-3 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <b className="text-light-gold block">
                  AGENT.md Rule 2: Strict PREMILY Mart Governance
                </b>
                <span>
                  The <b>Mart</b> badge is strictly reserved for official PREMILY brand collections or contracted corporate brand partners (e.g., PRAN-RFL, Click, Aura). Ordinary sellers must never receive it.
                </span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex items-center border border-border-gold rounded-xl px-3 py-2 bg-cream/30 w-full sm:w-72">
                <Search className="w-4 h-4 text-muted mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores, sellers, phones…"
                  className="w-full text-xs outline-none bg-transparent text-dark"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                {(["ALL", "MART", "VERIFIED", "PENDING"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setVendorFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border ${
                      vendorFilter === filter
                        ? "bg-dark text-light-gold border-dark"
                        : "bg-surface-subtle text-dark border-border-gold hover:border-deep"
                    }`}
                  >
                    {filter === "ALL"
                      ? "All Stores"
                      : filter === "MART"
                      ? "Mart Partners"
                      : filter === "VERIFIED"
                      ? "Verified"
                      : "Pending"}
                  </button>
                ))}
              </div>
            </div>

            {/* Stores Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-gold/40 text-muted bg-cream/40">
                    <th className="py-2.5 px-3">Store Name & Slug</th>
                    <th className="py-2.5 px-3">Merchant Contact</th>
                    <th className="py-2.5 px-3">Dispatch Base</th>
                    <th className="py-2.5 px-3">Verification (Rule 3)</th>
                    <th className="py-2.5 px-3">Mart Status (Rule 2)</th>
                    <th className="py-2.5 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold/30">
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-cream/20">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark block">
                            {store.displayName}
                          </span>
                        </div>
                        <Link
                          href={`/${store.slug}`}
                          className="text-[11px] text-deep hover:underline font-mono"
                        >
                          /{store.slug}
                        </Link>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-dark font-medium block">
                          {store.sellerName}
                        </span>
                        <span className="text-muted font-mono text-[11px]">
                          {store.phone}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-dark font-medium">
                        {store.homeDistrict}
                      </td>

                      <td className="py-3 px-3">
                        {store.verificationStatus === "VERIFIED" ? (
                          <VerifiedBadge size="sm" />
                        ) : store.verificationStatus === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => setReviewStore(store)}
                            className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-300 hover:bg-amber-100 cursor-pointer"
                          >
                            Review Docs ↗
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted">Unverified</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {store.isPremilyMart ? (
                          <div className="flex items-center gap-1.5">
                            <MartBadge size="sm" />
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              Official Partner
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted">Standard Merchant</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setReviewStore(store)}
                          className="px-2.5 py-1 rounded-lg border border-border-gold hover:border-deep text-[11px] font-semibold text-dark cursor-pointer hover:bg-cream"
                        >
                          Verify Docs
                        </button>

                        <button
                          type="button"
                          onClick={() => setMartTargetStore(store)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                            store.isPremilyMart
                              ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              : "gbtn"
                          }`}
                        >
                          {store.isPremilyMart ? "Revoke Mart" : "Grant Mart"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SELLER VERIFICATION WORKFLOW (AGENT.MD RULE 3) */}
        {activeTab === "verifications" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Seller Trade License & Biometric NID Review
              </h2>
              <p className="text-xs text-muted">
                Per AGENT.md Rule 3: Seller verification is independent from Mart status (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`).
              </p>
            </div>

            <div className="space-y-3">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-border-gold bg-cream/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <b className="text-sm text-dark font-serif">{s.displayName}</b>
                      {s.verificationStatus === "VERIFIED" ? (
                        <VerifiedBadge size="sm" />
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          {s.verificationStatus}
                        </span>
                      )}
                    </div>
                    <div className="text-muted">
                      Owner: <b>{s.sellerName}</b> · Phone: <span className="font-mono">{s.phone}</span>
                    </div>
                    <div className="text-[11px] text-dark font-mono pt-1">
                      Trade License: <b>{s.tradeLicenseNo || "Not provided"}</b> · NID:{" "}
                      <b>{s.nidNumber || "Not provided"}</b>
                    </div>
                    {s.verificationNote && (
                      <p className="text-[11px] text-muted italic">
                        Note: &ldquo;{s.verificationNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {s.verificationStatus !== "VERIFIED" ? (
                      <button
                        type="button"
                        onClick={() => handleApproveVerification(s.id)}
                        className="px-3 py-1.5 rounded-xl font-semibold text-xs bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve (VERIFIED)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRejectVerification(s.id)}
                        className="px-3 py-1.5 rounded-xl font-semibold text-xs border border-rose-300 text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        Revoke Verification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM ORDERS & MFS PAYMENT VERIFICATION */}
        {activeTab === "orders" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Nationwide Platform Orders & MFS Verification
              </h2>
              <p className="text-xs text-muted">
                Inspect cross-store orders and verify bKash / Nagad Transaction IDs submitted by buyers.
              </p>
            </div>

            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl border border-border-gold bg-cream/20 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-gold/40 pb-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-dark">
                        {o.orderNumber}
                      </span>
                      <span className="text-[11px] text-muted ml-2">
                        Store: <b className="text-dark">{o.storeName}</b>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-border-gold">
                        {o.paymentMethod}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          o.paymentStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        Payment {o.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted block text-[11px]">Buyer Information</span>
                      <b className="text-dark block">{o.customerName}</b>
                      <span className="text-muted font-mono block">{o.customerPhone}</span>
                      <span className="text-muted text-[11px] block mt-0.5">
                        {o.shippingAddress}, {o.shippingDistrict}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Order Total & Fee</span>
                      <b className="text-deep block text-sm">{formatTaka(o.total)}</b>
                      <span className="text-[11px] text-muted">
                        Subtotal: {formatTaka(o.subtotal)} · Delivery: {formatTaka(o.shippingCost)}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">MFS Transaction ID</span>
                      {o.transactionId ? (
                        <div className="font-mono font-bold text-dark text-sm">
                          {o.transactionId}
                        </div>
                      ) : (
                        <span className="text-muted text-[11px] italic">Cash on Delivery</span>
                      )}
                    </div>
                  </div>

                  {o.paymentStatus !== "VERIFIED" && o.transactionId && (
                    <div className="pt-2 border-t border-border-gold/30 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleVerifyPayment(o.id)}
                        className="gbtn px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
                      >
                        Verify MFS TrxID ({o.transactionId})
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 64-DISTRICT BASE LOGISTICS (AGENT.MD POINT 5) */}
        {activeTab === "logistics" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Nationwide 64-District Logistics Architecture
              </h2>
              <p className="text-xs text-muted">
                Per AGENT.md Point 5: Default platform rates are ৳70 Inside Dhaka (1–2 days) and ৳150 Outside Dhaka (3–5 days). Sellers can set custom overrides.
              </p>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-cream/40 border border-border-gold space-y-1">
                <span className="text-muted block">Zone: Inside Dhaka</span>
                <b className="text-lg font-serif text-dark block">৳70 Default Fee</b>
                <span className="text-emerald-700 font-semibold block">
                  1–2 Business Days Delivery (Steadfast / Pathao / RedX)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-cream/40 border border-border-gold space-y-1">
                <span className="text-muted block">Zone: Outside Dhaka (Nationwide)</span>
                <b className="text-lg font-serif text-dark block">৳150 Default Fee</b>
                <span className="text-emerald-700 font-semibold block">
                  3–5 Business Days Delivery across remaining 63 Districts
                </span>
              </div>
            </div>

            {/* 64 District Master Catalog */}
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-cream/80 backdrop-blur-xs">
                  <tr className="border-b border-border-gold/40 text-muted">
                    <th className="py-2 px-3">District</th>
                    <th className="py-2 px-3">Division</th>
                    <th className="py-2 px-3">Shipping Zone</th>
                    <th className="py-2 px-3">Base Cost</th>
                    <th className="py-2 px-3">Estimated Transit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold/20">
                  {BANGLADESH_DISTRICTS.map((d) => {
                    const isDhaka = d.name.toLowerCase() === "dhaka";
                    return (
                      <tr key={d.name} className="hover:bg-cream/20">
                        <td className="py-2 px-3 font-semibold text-dark">{d.name}</td>
                        <td className="py-2 px-3 text-muted">{d.division}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isDhaka
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {isDhaka ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA"}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-deep">
                          {isDhaka ? "৳70" : "৳150"}
                        </td>
                        <td className="py-2 px-3 text-muted">
                          {isDhaka ? "1–2 Days" : "3–5 Days"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CAMPAIGNS & FLASH SALES */}
        {activeTab === "campaigns" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Platform Promotional Campaigns & Flash Sales
              </h2>
              <p className="text-xs text-muted">
                Manage seasonal sales, flash sales rails, and hero discount banners on the PREMILY marketplace homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-2xl border border-border-gold bg-cream/20 space-y-3 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif text-sm font-bold text-dark block">
                        {camp.name}
                      </span>
                      <span className="text-[11px] text-deep font-semibold">
                        {camp.badgeText}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        camp.isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-slate-100 text-slate-600 border-slate-300"
                      }`}
                    >
                      {camp.isActive ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>

                  <p className="text-muted text-[11px] leading-relaxed">
                    {camp.description}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-border-gold/30">
                    <span className="text-[10px] text-muted">
                      Ends: {new Date(camp.endsAt).toLocaleDateString("en-BD")}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleCampaign(camp.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs cursor-pointer ${
                        camp.isActive
                          ? "border border-border-gold hover:bg-cream text-dark"
                          : "gbtn"
                      }`}
                    >
                      {camp.isActive ? "Pause Campaign" : "Activate Campaign"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: METRICS & SUBSCRIPTION MRR */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Platform GMV</span>
                <b className="text-2xl font-bold font-serif text-dark block">
                  {formatTaka(totalPlatformGMV)}
                </b>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  All seller checkouts
                </span>
              </div>

              <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Subscription MRR</span>
                <b className="text-2xl font-bold font-serif text-deep block">
                  {formatTaka(totalSubscriptionMRR)}
                </b>
                <span className="text-[10px] text-muted block">
                  ৳150 / seller / mo plan
                </span>
              </div>

              <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Mart Brand Partners</span>
                <b className="text-2xl font-bold text-dark block">
                  {martPartnerCount} Stores
                </b>
                <span className="text-[10px] text-muted block">Strictly vetted</span>
              </div>

              <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Verified Merchants</span>
                <b className="text-2xl font-bold text-emerald-700 block">
                  {stores.filter((s) => s.verificationStatus === "VERIFIED").length} Verified
                </b>
                <span className="text-[10px] text-muted block">Biometric NID / Trade</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: STRICT MART BADGE GOVERNANCE CONFIRMATION (AGENT.MD RULE 2) */}
      {martTargetStore && (
        <div className="fixed inset-0 z-50 bg-dark/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border-gold rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-dark text-gold grid place-items-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-dark">
                  {martTargetStore.isPremilyMart
                    ? "Revoke PREMILY Mart Badge?"
                    : "Grant Official PREMILY Mart Partner Badge?"}
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Target Store: <b>{martTargetStore.displayName}</b> ({martTargetStore.slug})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cream/60 border border-border-gold text-xs text-dark space-y-2">
              <b className="text-deep block">Non-Negotiable Qualification Checklist:</b>
              <ul className="space-y-1 text-[11px] text-muted list-disc list-inside">
                <li>Signed corporate distribution agreement or PREMILY flagship status.</li>
                <li>Guaranteed 98%+ order fulfillment SLA.</li>
                <li>Exclusive nationwide courier priority dispatch.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMartTargetStore(null)}
                className="px-4 py-2 rounded-xl border border-border-gold text-muted hover:text-dark text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMartToggle}
                className="gbtn px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                {martTargetStore.isPremilyMart ? "Revoke Mart Status" : "Confirm & Grant Mart Badge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERIFICATION DOCUMENT INSPECTOR (AGENT.MD RULE 3) */}
      {reviewStore && (
        <div className="fixed inset-0 z-50 bg-dark/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border-gold rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border-gold/50 pb-2">
              <h3 className="font-serif text-lg font-bold text-dark">
                Review Verification Documents
              </h3>
              <button
                type="button"
                onClick={() => setReviewStore(null)}
                className="text-muted hover:text-dark cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-cream/40 border border-border-gold space-y-1">
                <span className="text-muted block text-[11px]">Merchant Information</span>
                <b className="text-sm text-dark block">{reviewStore.displayName}</b>
                <div className="text-muted">
                  Owner: {reviewStore.sellerName} · Phone: <span className="font-mono">{reviewStore.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-border-gold bg-white">
                  <span className="text-muted block text-[10px]">Trade License No.</span>
                  <b className="font-mono text-dark block truncate">
                    {reviewStore.tradeLicenseNo || "N/A"}
                  </b>
                </div>

                <div className="p-2.5 rounded-xl border border-border-gold bg-white">
                  <span className="text-muted block text-[10px]">Biometric NID</span>
                  <b className="font-mono text-dark block truncate">
                    {reviewStore.nidNumber || "N/A"}
                  </b>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark block">Rejection Note (if rejecting):</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Blurred NID photo, please re-upload clear scan."
                  className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-gold/30">
                <button
                  type="button"
                  onClick={() => handleRejectVerification(reviewStore.id)}
                  className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                >
                  Reject Verification
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveVerification(reviewStore.id)}
                  className="gbtn px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Approve as VERIFIED
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
