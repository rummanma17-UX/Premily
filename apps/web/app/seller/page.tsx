"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Settings,
  Store,
  Plus,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export default function SellerPanelPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "shipping" | "profile">("overview");

  // Profile form state
  const [storeName, setStoreName] = useState("Aura Home Studio");
  const [description, setDescription] = useState(
    "Artisan furniture, custom upholstery, and luxury handcrafted home decor."
  );
  const [homeDistrict, setHomeDistrict] = useState("Dhaka");
  const [insideCost, setInsideCost] = useState(70);
  const [outsideCost, setOutsideCost] = useState(150);
  const [primaryColor, setPrimaryColor] = useState("#B8924B");
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
  );
  const [isSaved, setIsSaved] = useState(false);

  // Sample seller products
  const [products] = useState([
    {
      id: "p1",
      name: "Aura Curved Lounge Chair",
      category: "Furniture",
      price: 18500,
      stock: 12,
      sold: 140,
    },
    {
      id: "p2",
      name: "Velvet Accent Armchair",
      category: "Furniture",
      price: 22000,
      stock: 8,
      sold: 95,
    },
    {
      id: "p3",
      name: "Travertine Coffee Table",
      category: "Living Room",
      price: 24000,
      stock: 5,
      sold: 42,
    },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white border-r border-border-gold flex flex-col shrink-0">
        <div className="p-5 border-b border-border-gold/40">
          <Link href="/" className="text-xs text-muted hover:text-dark flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Marketplace
          </Link>
          <h1 className="font-serif text-lg font-bold text-dark leading-tight">
            {storeName}
          </h1>
          <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
            ✓ Verified Seller
          </span>
        </div>

        <nav className="p-4 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-cream text-deep font-semibold shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "products"
                ? "bg-cream text-deep font-semibold shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            }`}
          >
            <Package className="w-4 h-4" />
            My Products ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "shipping"
                ? "bg-cream text-deep font-semibold shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            }`}
          >
            <Truck className="w-4 h-4" />
            Shipping & Delivery
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-cream text-deep font-semibold shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            }`}
          >
            <Settings className="w-4 h-4" />
            Storefront Settings
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-border-gold/30 bg-surface-subtle">
          <Link
            href="/aura-home"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-gold bg-white text-xs font-semibold text-dark hover:border-deep transition"
          >
            <Store className="w-3.5 h-3.5 text-deep" />
            View Public Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-5xl space-y-6">
        {isSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Settings saved successfully!
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="premily-card p-6 rounded-2xl bg-dark text-cream border border-gold/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs uppercase text-gold font-semibold tracking-wider">
                  PREMILY Seller Dashboard
                </span>
                <h2 className="font-serif text-2xl font-bold mt-1">
                  Welcome back, {storeName}
                </h2>
                <p className="text-xs text-cream/70 mt-0.5">
                  Your store subscription is active (৳150/mo plan).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className="gbtn px-5 py-2.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="premily-card p-4 rounded-xl border border-border-gold bg-white space-y-1">
                <span className="text-xs text-muted block">Store Revenue</span>
                <b className="text-lg sm:text-xl font-bold text-dark font-serif">
                  {formatTaka(148500)}
                </b>
                <span className="text-[10px] text-emerald-600 block font-medium">+15.2% this month</span>
              </div>

              <div className="premily-card p-4 rounded-xl border border-border-gold bg-white space-y-1">
                <span className="text-xs text-muted block">Completed Orders</span>
                <b className="text-lg sm:text-xl font-bold text-dark">84</b>
                <span className="text-[10px] text-muted block">All fulfilled</span>
              </div>

              <div className="premily-card p-4 rounded-xl border border-border-gold bg-white space-y-1">
                <span className="text-xs text-muted block">Active Products</span>
                <b className="text-lg sm:text-xl font-bold text-dark">{products.length}</b>
                <span className="text-[10px] text-muted block">In stock</span>
              </div>

              <div className="premily-card p-4 rounded-xl border border-border-gold bg-white space-y-1">
                <span className="text-xs text-muted block">Store Rating</span>
                <b className="text-lg sm:text-xl font-bold text-deep">4.9 ★</b>
                <span className="text-[10px] text-muted block">312 customer reviews</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-lg font-bold text-dark">Product Catalog</h2>
                <p className="text-xs text-muted">Manage your stock, variants, and pricing.</p>
              </div>
              <button type="button" className="gbtn px-4 py-2 rounded-full text-xs font-semibold">
                + New Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-gold/40 text-muted bg-cream/40">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold/30">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/20">
                      <td className="py-3 px-3 font-semibold text-dark">{p.name}</td>
                      <td className="py-3 px-3 text-muted">{p.category}</td>
                      <td className="py-3 px-3 font-bold text-deep">{formatTaka(p.price)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted">{p.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SHIPPING SETTINGS */}
        {activeTab === "shipping" && (
          <form onSubmit={handleSave} className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white space-y-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-dark">Store Delivery Rules</h2>
              <p className="text-xs text-muted">
                Configure your home dispatch district and custom delivery fees.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-dark">Home Dispatch District</label>
                <select
                  value={homeDistrict}
                  onChange={(e) => setHomeDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted block">Your warehouse/store location</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark">Inside Local District Fee (৳)</label>
                <input
                  type="number"
                  value={insideCost}
                  onChange={(e) => setInsideCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep"
                />
                <span className="text-[10px] text-muted block">Default is ৳70 (1-2 days)</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark">Outside District Fee (৳)</label>
                <input
                  type="number"
                  value={outsideCost}
                  onChange={(e) => setOutsideCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep"
                />
                <span className="text-[10px] text-muted block">Default is ৳150 (3-5 days)</span>
              </div>
            </div>

            <button type="submit" className="gbtn px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs">
              Save Delivery Rules
            </button>
          </form>
        )}

        {/* TAB 4: STORE PROFILE */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white space-y-4 text-xs">
            <div>
              <h2 className="font-serif text-lg font-bold text-dark">Custom Storefront Branding</h2>
              <p className="text-muted">
                Your store gets its own dedicated homepage at <b>premily.com/[your-slug]</b>. Customize how it looks.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-dark">Store Display Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-dark">Store Bio / Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-dark">Brand Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border-gold cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark">Store Banner Image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark outline-none focus:border-deep"
                />
              </div>
            </div>

            <button type="submit" className="gbtn px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs">
              Save Storefront Profile
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
