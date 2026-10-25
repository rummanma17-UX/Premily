"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Users,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { MartBadge } from "@/components/badges/MartBadge";
import { VerifiedBadge } from "@/components/badges/VerifiedBadge";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

type VendorItem = {
  id: string;
  slug: string;
  displayName: string;
  sellerName: string;
  phone: string;
  isPremilyMart: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  productsCount: number;
};

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<"vendors" | "overview">("vendors");

  // Sample Vendor list with stateful actions
  const [vendors, setVendors] = useState<VendorItem[]>([
    {
      id: "store-1",
      slug: "aura-home",
      displayName: "Aura Home Studio",
      sellerName: "Abdullah Al Rumman",
      phone: "01711111111",
      isPremilyMart: true,
      verificationStatus: "VERIFIED",
      productsCount: 24,
    },
    {
      id: "store-2",
      slug: "lumina-decor",
      displayName: "Lumina Lighting Co.",
      sellerName: "Kamrul Islam",
      phone: "01822222222",
      isPremilyMart: false,
      verificationStatus: "VERIFIED",
      productsCount: 15,
    },
    {
      id: "store-3",
      slug: "clay-craft",
      displayName: "Clay & Craft Pottery",
      sellerName: "Nazmul Huda",
      phone: "01933333333",
      isPremilyMart: false,
      verificationStatus: "PENDING",
      productsCount: 9,
    },
    {
      id: "store-4",
      slug: "rfl-official",
      displayName: "RFL Home Solutions",
      sellerName: "PRAN-RFL Group Partner",
      phone: "01744444444",
      isPremilyMart: true,
      verificationStatus: "VERIFIED",
      productsCount: 68,
    },
  ]);

  const toggleMartStatus = (storeId: string) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === storeId ? { ...v, isPremilyMart: !v.isPremilyMart } : v
      )
    );
  };

  const toggleVerification = (storeId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === storeId) {
          const nextStatus = v.verificationStatus === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
          return { ...v, verificationStatus: nextStatus };
        }
        return v;
      })
    );
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-dark text-cream border-r border-gold/30 shrink-0 flex flex-col">
        <div className="p-5 border-b border-gold/20">
          <Link href="/" className="text-xs text-gold/80 hover:text-gold flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketplace Home
          </Link>
          <div className="font-serif text-xl font-bold tracking-wider text-cream">
            PREMILY <span className="text-gold">Admin</span>
          </div>
          <span className="text-[10px] text-light-gold">Superadmin Control Panel</span>
        </div>

        <nav className="p-4 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("vendors")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "vendors"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/70 hover:text-cream hover:bg-white/5"
            }`}
          >
            <Store className="w-4 h-4" />
            Vendor & Mart Controls
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-gold text-dark font-bold shadow-xs"
                : "text-cream/70 hover:text-cream hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Platform Metrics
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-gold/40 pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-dark">
              Platform Administration
            </h1>
            <p className="text-xs text-muted">
              Manage seller verification, grant official PREMILY Mart partner badges, and monitor platform orders.
            </p>
          </div>
        </div>

        {/* TAB 1: VENDOR CONTROLS */}
        {activeTab === "vendors" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4">
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-bold text-dark">
                Seller Verification & Mart Status
              </h2>
              <p className="text-xs text-muted">
                <b>Product Rule Reminder:</b> The <i>Mart</i> badge is exclusive to official PREMILY products or approved official brand partners (e.g. RFL, CLICK). Ordinary sellers must not receive it.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-gold/40 text-muted bg-cream/40">
                    <th className="py-2.5 px-3">Store & Brand</th>
                    <th className="py-2.5 px-3">Owner Contact</th>
                    <th className="py-2.5 px-3">Catalog Size</th>
                    <th className="py-2.5 px-3">Seller Verification</th>
                    <th className="py-2.5 px-3">PREMILY Mart Badge</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold/30">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-cream/20">
                      <td className="py-3 px-3">
                        <span className="font-bold text-dark block">{v.displayName}</span>
                        <Link href={`/${v.slug}`} className="text-deep hover:underline text-[11px]">
                          /{v.slug}
                        </Link>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-dark block font-medium">{v.sellerName}</span>
                        <span className="text-muted text-[11px] font-mono">{v.phone}</span>
                      </td>

                      <td className="py-3 px-3 text-dark font-medium">
                        {v.productsCount} items
                      </td>

                      <td className="py-3 px-3">
                        {v.verificationStatus === "VERIFIED" ? (
                          <VerifiedBadge size="sm" />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                            Pending Review
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {v.isPremilyMart ? (
                          <MartBadge size="sm" />
                        ) : (
                          <span className="text-[11px] text-muted">Standard Seller</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => toggleVerification(v.id)}
                          className="px-2.5 py-1 rounded-lg border border-border-gold hover:border-deep text-[11px] font-semibold text-dark cursor-pointer"
                        >
                          {v.verificationStatus === "VERIFIED" ? "Revoke Verification" : "Approve Seller"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleMartStatus(v.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            v.isPremilyMart
                              ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              : "gbtn"
                          }`}
                        >
                          {v.isPremilyMart ? "Remove Mart" : "Grant Mart"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1">
              <span className="text-xs text-muted block">Platform GMV</span>
              <b className="text-xl font-bold font-serif text-dark">{formatTaka(1428500)}</b>
              <span className="text-[10px] text-emerald-600 block font-semibold">+18.4% monthly</span>
            </div>

            <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1">
              <span className="text-xs text-muted block">Registered Sellers</span>
              <b className="text-xl font-bold text-dark">{vendors.length} Stores</b>
              <span className="text-[10px] text-muted block">৳150/mo subscription model</span>
            </div>

            <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1">
              <span className="text-xs text-muted block">Mart Brand Partners</span>
              <b className="text-xl font-bold text-deep">
                {vendors.filter((v) => v.isPremilyMart).length} Approved
              </b>
              <span className="text-[10px] text-muted block">RFL, Aura, Click</span>
            </div>

            <div className="premily-card p-5 rounded-2xl border border-border-gold bg-white space-y-1">
              <span className="text-xs text-muted block">Total Platform Orders</span>
              <b className="text-xl font-bold text-dark">1,482 Orders</b>
              <span className="text-[10px] text-emerald-600 block font-semibold">96% Delivery success</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
