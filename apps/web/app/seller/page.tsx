"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Truck,
  Settings,
  Store,
  Plus,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Edit2,
  Trash2,
  ShieldCheck,
  X,
} from "lucide-react";
import { BANGLADESH_DISTRICTS } from "@/lib/bangladesh-districts";
import {
  StoreService,
  type StoreRecord,
  type ProductRecord,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/store-data";
import { MartBadge } from "@/components/badges/MartBadge";
import { VerifiedBadge } from "@/components/badges/VerifiedBadge";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

function generateConsignmentId(partner: string) {
  return `${partner.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-BD`;
}

const LUXURY_BANNER_PRESETS = [
  {
    name: "Minimalist Boucle Living",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Modern Travertine & Brass",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Artisan Terracotta Studio",
    url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Architectural Warm Sconce",
    url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80",
  },
];

const LUXURY_IMAGE_PRESETS = [
  {
    name: "Curved Lounge Chair",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Velvet Accent Armchair",
    url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Travertine Coffee Table",
    url: "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Alabaster Brass Pendant",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Terracotta Vase Trio",
    url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
  },
];

export default function SellerPanelPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "shipping" | "profile" | "verification"
  >("overview");

  // Load current seller store (defaults to aura-home for vendor operations)
  const [currentStore, setCurrentStore] = useState<StoreRecord>(() => {
    return StoreService.getStoreBySlug("aura-home") || StoreService.getStores()[0];
  });

  const [products, setProducts] = useState<ProductRecord[]>(() =>
    StoreService.getProductsByStore(currentStore?.slug || "aura-home")
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    StoreService.getOrdersByStore(currentStore?.slug || "aura-home")
  );
  const [saveBannerMsg, setSaveBannerMsg] = useState<string | null>(null);

  // Profile form state
  const [displayName, setDisplayName] = useState(currentStore.displayName);
  const [slug, setSlug] = useState(currentStore.slug);
  const [description, setDescription] = useState(currentStore.description);
  const [primaryColor, setPrimaryColor] = useState(currentStore.primaryColor);
  const [bannerUrl, setBannerUrl] = useState(currentStore.bannerUrl);

  // Shipping form state (AGENT.md Point 5)
  const [homeDistrict, setHomeDistrict] = useState(currentStore.homeDistrict);
  const [insideCost, setInsideCost] = useState(currentStore.insideDistrictCost);
  const [outsideCost, setOutsideCost] = useState(currentStore.outsideDistrictCost);
  const [districtOverrides, setDistrictOverrides] = useState(currentStore.districtOverrides || []);
  const [newOverrideDistrict, setNewOverrideDistrict] = useState("Gazipur");
  const [newOverrideRate, setNewOverrideRate] = useState(90);

  // Verification form state (AGENT.md Point 3)
  const [tradeLicense, setTradeLicense] = useState(currentStore.tradeLicenseNo || "");
  const [nidNumber, setNidNumber] = useState(currentStore.nidNumber || "");
  const [verificationNote, setVerificationNote] = useState(currentStore.verificationNote || "");

  // Subscription modal state (AGENT.md Business model ৳150/mo)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionRenewing, setSubscriptionRenewing] = useState(false);
  const [mfsTrxId, setMfsTrxId] = useState("");

  // Product modal state (Add / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Furniture");
  const [prodPrice, setProdPrice] = useState(15000);
  const [prodComparePrice, setProdComparePrice] = useState(19000);
  const [prodStock, setProdStock] = useState(10);
  const [prodSizes, setProdSizes] = useState("Standard");
  const [prodColors, setProdColors] = useState("Ivory, Charcoal");
  const [prodImage, setProdImage] = useState(LUXURY_IMAGE_PRESETS[0].url);
  const [prodDesc, setProdDesc] = useState("");

  const [courierPartner, setCourierPartner] = useState<"Steadfast" | "Pathao" | "RedX" | "Paperfly">("Steadfast");

  const currentStoreSlug = currentStore.slug;

  useEffect(() => {
    const handleSync = () => {
      const store = StoreService.getStoreBySlug(currentStoreSlug);
      if (store) {
        setCurrentStore(store);
        setProducts(StoreService.getProductsByStore(store.slug));
        setOrders(StoreService.getOrdersByStore(store.slug));
      }
    };

    window.addEventListener("premily_data_change", handleSync);
    window.addEventListener("premily_order_created", handleSync);
    return () => {
      window.removeEventListener("premily_data_change", handleSync);
      window.removeEventListener("premily_order_created", handleSync);
    };
  }, [currentStoreSlug]);

  const showFeedback = (msg: string) => {
    setSaveBannerMsg(msg);
    setTimeout(() => setSaveBannerMsg(null), 3000);
  };

  // Save Storefront Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StoreService.updateStore({
      id: currentStore.id,
      displayName,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      description,
      primaryColor,
      bannerUrl,
    });
    setCurrentStore(updated);
    showFeedback("Storefront branding updated successfully!");
  };

  // Save Shipping Rules
  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StoreService.updateStore({
      id: currentStore.id,
      homeDistrict,
      insideDistrictCost: Number(insideCost),
      outsideDistrictCost: Number(outsideCost),
      districtOverrides,
    });
    setCurrentStore(updated);
    showFeedback("District delivery rates saved!");
  };

  const handleAddOverride = () => {
    if (!newOverrideDistrict) return;
    const exists = districtOverrides.some((d) => d.district === newOverrideDistrict);
    if (exists) {
      alert("This district already has a custom rate override.");
      return;
    }
    const updated = [...districtOverrides, { district: newOverrideDistrict, rate: Number(newOverrideRate) }];
    setDistrictOverrides(updated);
  };

  const handleRemoveOverride = (dist: string) => {
    setDistrictOverrides(districtOverrides.filter((d) => d.district !== dist));
  };

  // Submit Trade License & NID verification (AGENT.md Point 3)
  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StoreService.updateStore({
      id: currentStore.id,
      verificationStatus: "PENDING",
      tradeLicenseNo: tradeLicense.trim(),
      nidNumber: nidNumber.trim(),
      verificationNote: verificationNote.trim() || "Documents submitted by merchant for PREMILY Admin review.",
      submittedAt: new Date().toISOString(),
    });
    setCurrentStore(updated);
    showFeedback("Verification documents submitted for PREMILY Admin review.");
  };

  // Product CRUD
  const openAddProductModal = () => {
    setEditingProductId(null);
    setProdName("");
    setProdCategory("Furniture");
    setProdPrice(15000);
    setProdComparePrice(19000);
    setProdStock(10);
    setProdSizes("Standard");
    setProdColors("Cream Boucle, Oak");
    setProdImage(LUXURY_IMAGE_PRESETS[0].url);
    setProdDesc("Handcrafted luxury home furnishing designed with architectural precision.");
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: ProductRecord) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.categoryName);
    setProdPrice(p.price);
    setProdComparePrice(p.compareAtPrice || 0);
    setProdStock(p.stock);
    setProdSizes(p.sizes.join(", "));
    setProdColors(p.colors.join(", "));
    setProdImage(p.imageUrl);
    setProdDesc(p.description);
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = prodSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colorsArray = prodColors.split(",").map((c) => c.trim()).filter(Boolean);

    if (editingProductId) {
      StoreService.updateProduct(editingProductId, {
        name: prodName,
        categoryName: prodCategory,
        price: Number(prodPrice),
        compareAtPrice: prodComparePrice ? Number(prodComparePrice) : null,
        stock: Number(prodStock),
        sizes: sizesArray,
        colors: colorsArray,
        imageUrl: prodImage,
        description: prodDesc,
      });
      showFeedback(`Product "${prodName}" updated!`);
    } else {
      StoreService.addProduct({
        storeId: currentStore.id,
        storeSlug: currentStore.slug,
        storeName: currentStore.displayName,
        name: prodName,
        slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: prodDesc,
        categoryId: prodCategory.toLowerCase(),
        categoryName: prodCategory,
        price: Number(prodPrice),
        compareAtPrice: prodComparePrice ? Number(prodComparePrice) : null,
        stock: Number(prodStock),
        sizes: sizesArray,
        colors: colorsArray,
        imageUrl: prodImage,
        status: "ACTIVE",
      });
      showFeedback(`Product "${prodName}" launched to catalog!`);
    }

    setProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from your store catalog?`)) {
      StoreService.deleteProduct(id);
      showFeedback(`Product "${name}" deleted.`);
    }
  };

  // Order Fulfillment progression
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const consignmentId = generateConsignmentId(courierPartner);
    StoreService.updateOrderStatus(orderId, nextStatus, {
      partner: courierPartner,
      consignmentId,
    });
    showFeedback(`Order updated to ${nextStatus}! Consignment booked with ${courierPartner}.`);
  };

  // Subscription Renewal (৳150/month)
  const handleRenewSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscriptionRenewing(true);

    setTimeout(() => {
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      const updated = StoreService.updateStore({
        id: currentStore.id,
        subscription: {
          status: "ACTIVE",
          planAmount: 150,
          trialEndsAt: currentStore.subscription.trialEndsAt,
          currentPeriodEnd: renewalDate.toISOString(),
        },
      });
      setCurrentStore(updated);
      setSubscriptionRenewing(false);
      setSubscriptionModalOpen(false);
      setMfsTrxId("");
      showFeedback("৳150 monthly subscription renewed successfully!");
    }, 1200);
  };

  const totalStoreRevenue = orders
    .filter((o) => o.orderStatus !== "CANCELLED")
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-68 bg-white border-r border-border-gold flex flex-col shrink-0">
        {/* Brand identity header */}
        <div className="p-5 border-b border-border-gold/60 bg-cream/30">
          <Link
            href="/"
            className="text-xs text-muted hover:text-dark flex items-center gap-1 mb-3 font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Marketplace
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg grid place-items-center text-xs font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: currentStore.primaryColor || "#B8924B" }}
            >
              {currentStore.displayName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-sm font-bold text-dark truncate">
                {currentStore.displayName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {currentStore.verificationStatus === "VERIFIED" ? (
                  <VerifiedBadge size="sm" />
                ) : (
                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {currentStore.verificationStatus === "PENDING" ? "Review Pending" : "Unverified"}
                  </span>
                )}
                {currentStore.isPremilyMart && <MartBadge size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-3 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-dark text-light-gold font-bold shadow-xs"
                : "text-muted hover:text-dark hover:bg-cream/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-gold" />
              <span>Overview & Metrics</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "products"
                ? "bg-dark text-light-gold font-bold shadow-xs"
                : "text-muted hover:text-dark hover:bg-cream/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-gold" />
              <span>Catalog & Products</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-dark font-bold">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-dark text-light-gold font-bold shadow-xs"
                : "text-muted hover:text-dark hover:bg-cream/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span>Orders & Courier</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "shipping"
                ? "bg-dark text-light-gold font-bold shadow-xs"
                : "text-muted hover:text-dark hover:bg-cream/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-gold" />
              <span>64-District Logistics</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-dark text-light-gold font-bold shadow-xs"
                : "text-muted hover:text-dark hover:bg-cream/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-gold" />
              <span>Storefront Branding</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === "verification"
                ? "bg-dark text-light-gold font-bold shadow-xs"
                : "text-muted hover:text-dark hover:bg-cream/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Trade License & NID</span>
            </div>
          </button>
        </nav>

        {/* Dedicated Storefront Quick Link (AGENT.md Point 1) */}
        <div className="mt-auto p-4 border-t border-border-gold/40 bg-cream/40 space-y-3">
          <div className="p-3 rounded-xl bg-white border border-border-gold space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-dark">Plan Status</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                {currentStore.subscription.status}
              </span>
            </div>
            <div className="text-[10px] text-muted">
              ৳150 / month · Zero commission
            </div>
            <button
              type="button"
              onClick={() => setSubscriptionModalOpen(true)}
              className="text-[11px] text-deep font-bold hover:underline cursor-pointer block"
            >
              Manage Subscription →
            </button>
          </div>

          <Link
            href={`/${currentStore.slug}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border-gold bg-white text-xs font-bold text-dark hover:border-deep hover:bg-cream/50 transition shadow-xs"
          >
            <Store className="w-4 h-4 text-deep" />
            <span>Open Dedicated Storefront</span>
            <ExternalLink className="w-3 h-3 text-muted" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6">
        {saveBannerMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 font-medium shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveBannerMsg}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Hero Welcome Banner */}
            <div className="p-6 rounded-3xl bg-[#1E1916] text-[#FAF3E8] border border-gold/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
              <div className="space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase text-gold font-bold tracking-widest">
                    PREMILY Merchant Operations
                  </span>
                  {currentStore.isPremilyMart && <MartBadge size="sm" />}
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                  {currentStore.displayName}
                </h2>
                <p className="text-xs text-cream/70 leading-relaxed">
                  Dedicated URL: <b className="text-light-gold">premily.com/{currentStore.slug}</b> · 
                  64-district fulfillment active via {currentStore.homeDistrict} hub.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="gbtn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
                <Link
                  href={`/${currentStore.slug}`}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gold/60 text-light-gold hover:bg-gold/10 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Public Store</span>
                </Link>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Store GMV</span>
                <b className="text-xl font-bold font-serif text-dark block">
                  {formatTaka(totalStoreRevenue)}
                </b>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  100% direct seller earnings
                </span>
              </div>

              <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Orders Received</span>
                <b className="text-xl font-bold text-dark block">{orders.length} Orders</b>
                <span className="text-[10px] text-muted block">
                  {orders.filter((o) => o.orderStatus === "DELIVERED").length} delivered
                </span>
              </div>

              <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Active Products</span>
                <b className="text-xl font-bold text-dark block">{products.length} Items</b>
                <span className="text-[10px] text-emerald-600 block">
                  {products.reduce((acc, p) => acc + p.stock, 0)} total in stock
                </span>
              </div>

              <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white space-y-1 shadow-xs">
                <span className="text-xs text-muted block">Buyer Rating</span>
                <b className="text-xl font-bold text-deep block">4.9 ★</b>
                <span className="text-[10px] text-muted block">Verified reviews</span>
              </div>
            </div>

            {/* Recent Orders Stream */}
            <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-base font-bold text-dark">
                    Latest Incoming Orders
                  </h3>
                  <p className="text-xs text-muted">
                    Fulfill customer deliveries per-store across Bangladesh.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-deep font-semibold hover:underline cursor-pointer"
                >
                  View All Orders ({orders.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-gold/40 text-muted bg-cream/40">
                      <th className="py-2.5 px-3">Order Number</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gold/30">
                    {orders.slice(0, 3).map((o) => (
                      <tr key={o.id} className="hover:bg-cream/20">
                        <td className="py-3 px-3 font-mono font-bold text-dark">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-dark block">{o.customerName}</span>
                          <span className="text-[11px] text-muted font-mono">{o.customerPhone}</span>
                        </td>
                        <td className="py-3 px-3 text-dark">{o.shippingDistrict}</td>
                        <td className="py-3 px-3 font-bold text-deep">
                          {formatTaka(o.total)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cream border border-border-gold">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              o.orderStatus === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : o.orderStatus === "SHIPPED"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : o.orderStatus === "PROCESSING"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-800 border-slate-300"
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG */}
        {activeTab === "products" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-dark">
                  Store Product Catalog
                </h2>
                <p className="text-xs text-muted">
                  Products live on your store at <b>premily.com/{currentStore.slug}</b> and the PREMILY marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddProductModal}
                className="gbtn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-gold/40 text-muted bg-cream/40">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Sold</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gold/30">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/20">
                      <td className="py-3 px-3 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-border-gold shrink-0"
                        />
                        <div>
                          <span className="font-bold text-dark block">{p.name}</span>
                          <span className="text-[11px] text-muted">
                            Sizes: {p.sizes.join(", ") || "Standard"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-dark">{p.categoryName}</td>

                      <td className="py-3 px-3 font-bold text-deep">
                        <div>{formatTaka(p.price)}</div>
                        {p.compareAtPrice && (
                          <div className="text-[10px] text-muted line-through font-normal">
                            {formatTaka(p.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            p.stock > 5
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>

                      <td className="py-3 px-3 text-muted">{p.salesCount} sold</td>

                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 rounded-lg border border-border-gold hover:border-deep text-dark hover:bg-cream transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-border-gold hover:border-rose-300 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & COURIER DISPATCH */}
        {activeTab === "orders" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Customer Orders & Courier Dispatch
              </h2>
              <p className="text-xs text-muted">
                Each PREMILY merchant manages their own fulfillment. Dispatch orders via Steadfast, Pathao, or RedX.
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl border border-border-gold bg-cream/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border-gold/40 pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-sm text-dark">
                        {o.orderNumber}
                      </span>
                      <span className="text-[11px] text-muted ml-2">
                        {new Date(o.createdAt).toLocaleDateString("en-BD")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-border-gold">
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          o.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : o.orderStatus === "SHIPPED"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : o.orderStatus === "PROCESSING"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted block text-[11px]">Customer & Destination</span>
                      <b className="text-dark block">{o.customerName}</b>
                      <span className="text-muted font-mono block">{o.customerPhone}</span>
                      <span className="text-muted block text-[11px] mt-0.5">
                        {o.shippingAddress}, {o.shippingDistrict}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Purchased Items</span>
                      {o.items.map((item, idx) => (
                        <div key={idx} className="text-dark font-medium">
                          {item.quantity}x {item.name} ({item.variantLabel})
                        </div>
                      ))}
                      <div className="text-[11px] text-muted mt-1">
                        Shipping Fee: {formatTaka(o.shippingCost)} · Total:{" "}
                        <b className="text-deep">{formatTaka(o.total)}</b>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Logistics & Tracking</span>
                      {o.courierPartner ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-dark block">
                            Courier: {o.courierPartner}
                          </span>
                          <span className="font-mono text-[11px] text-deep block">
                            Consignment ID: {o.consignmentId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted text-[11px] italic">
                          Courier consignment not generated yet.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Status Action Workflow */}
                  <div className="pt-2 border-t border-border-gold/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-muted">Courier:</span>
                      <select
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value as "Steadfast" | "Pathao" | "RedX" | "Paperfly")}
                        className="px-2 py-1 rounded-lg border border-border-gold bg-white text-xs outline-none"
                      >
                        <option value="Steadfast">Steadfast Courier</option>
                        <option value="Pathao">Pathao Express</option>
                        <option value="RedX">RedX Logistics</option>
                        <option value="Paperfly">Paperfly BD</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {o.orderStatus === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(o.id, "CONFIRMED")}
                          className="gbtn px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          Confirm Order
                        </button>
                      )}

                      {o.orderStatus === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(o.id, "PROCESSING")}
                          className="gbtn px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          Mark Processing & Pack
                        </button>
                      )}

                      {o.orderStatus === "PROCESSING" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(o.id, "SHIPPED")}
                          className="gbtn px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          Handover to {courierPartner} (Ship)
                        </button>
                      )}

                      {o.orderStatus === "SHIPPED" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(o.id, "DELIVERED")}
                          className="px-3 py-1.5 rounded-lg font-semibold text-xs bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                        >
                          Confirm Delivery Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SHIPPING & DELIVERY RULES (AGENT.MD POINT 5) */}
        {activeTab === "shipping" && (
          <form
            onSubmit={handleSaveShipping}
            className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-6 text-xs"
          >
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Nationwide 64-District Logistics Rules
              </h2>
              <p className="text-muted">
                Per AGENT.md Point 5, PREMILY sellers manage independent delivery rates from their dispatch base.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Home Base District
                </label>
                <select
                  value={homeDistrict}
                  onChange={(e) => setHomeDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/40 text-dark outline-none focus:border-deep"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.division} Division)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted block">
                  Your warehouse or store pickup point.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Inside Local District (৳)
                </label>
                <input
                  type="number"
                  value={insideCost}
                  onChange={(e) => setInsideCost(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/40 text-dark outline-none focus:border-deep font-semibold"
                />
                <span className="text-[10px] text-muted block">
                  Default: ৳70 (1–2 days delivery).
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Outside District Nationwide (৳)
                </label>
                <input
                  type="number"
                  value={outsideCost}
                  onChange={(e) => setOutsideCost(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/40 text-dark outline-none focus:border-deep font-semibold"
                />
                <span className="text-[10px] text-muted block">
                  Default: ৳150 (3–5 days delivery).
                </span>
              </div>
            </div>

            {/* Custom District Overrides */}
            <div className="pt-4 border-t border-border-gold/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-bold text-dark block text-sm">
                  Custom District Rate Overrides
                </label>
                <span className="text-[11px] text-muted">
                  Set specific shipping fees for neighbouring high-volume districts.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={newOverrideDistrict}
                  onChange={(e) => setNewOverrideDistrict(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border-gold bg-white outline-none"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center border border-border-gold rounded-xl px-2.5 py-1.5 bg-white">
                  <span className="text-muted mr-1 font-semibold">৳</span>
                  <input
                    type="number"
                    value={newOverrideRate}
                    onChange={(e) => setNewOverrideRate(Number(e.target.value))}
                    className="w-20 outline-none font-semibold text-dark"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddOverride}
                  className="px-3 py-2 rounded-xl border border-border-gold bg-cream text-dark hover:border-deep font-semibold cursor-pointer"
                >
                  + Add Override
                </button>
              </div>

              {districtOverrides.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {districtOverrides.map((ov) => (
                    <div
                      key={ov.district}
                      className="p-2.5 rounded-xl border border-border-gold bg-cream/30 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-dark block">{ov.district}</span>
                        <span className="text-[11px] text-deep font-semibold">
                          ৳{ov.rate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOverride(ov.district)}
                        className="text-muted hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="gbtn px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
            >
              Save Shipping Settings
            </button>
          </form>
        )}

        {/* TAB 5: STOREFRONT PROFILE & BRANDING (AGENT.MD POINT 1) */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleSaveProfile}
            className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-6 text-xs"
          >
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Branded Dedicated Storefront Profile
              </h2>
              <p className="text-muted">
                Per AGENT.md Point 1, your store has its own dedicated homepage at{" "}
                <b className="text-deep font-mono">premily.com/{slug}</b>. Shoppers feel you own the website.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-dark block">Store Display Name *</label>
                <input
                  required
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/30 text-dark outline-none focus:border-deep font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark block">Custom URL Slug *</label>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2.5 bg-cream/30">
                  <span className="text-muted text-[11px] mr-1">premily.com/</span>
                  <input
                    required
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent outline-none font-mono text-dark font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-dark block">Store Bio & Tagline</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your craft, materials, and artisan philosophy…"
                className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/30 text-dark outline-none focus:border-deep"
              />
            </div>

            {/* Brand Accent Color */}
            <div className="space-y-2">
              <label className="font-semibold text-dark block">
                Brand Accent Color & Presets
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 border border-border-gold rounded-xl p-1 bg-cream/30">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-border-gold"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 text-xs font-mono font-semibold outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { label: "Imperial Gold", hex: "#B8924B" },
                    { label: "Forest Emerald", hex: "#1E3F20" },
                    { label: "Terracotta Clay", hex: "#8C6239" },
                    { label: "Crimson Velvet", hex: "#BE123C" },
                    { label: "Espresso Noir", hex: "#1E1916" },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-border-gold cursor-pointer transition hover:scale-105"
                      style={{ backgroundColor: preset.hex, color: "#FFFFFF" }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner URL with Luxury Presets */}
            <div className="space-y-2">
              <label className="font-semibold text-dark block">
                Hero Banner Image URL
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/30 text-dark outline-none focus:border-deep font-mono text-[11px]"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {LUXURY_BANNER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBannerUrl(preset.url)}
                    className="p-1 rounded-xl border border-border-gold hover:border-deep text-left cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-16 object-cover rounded-lg group-hover:opacity-90"
                    />
                    <span className="text-[10px] text-muted block truncate mt-1">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="gbtn px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
            >
              Save Storefront Branding
            </button>
          </form>
        )}

        {/* TAB 6: SELLER VERIFICATION (AGENT.MD POINT 3) */}
        {activeTab === "verification" && (
          <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-6 text-xs">
            <div>
              <h2 className="font-serif text-xl font-bold text-dark">
                Seller Verification & Trade License
              </h2>
              <p className="text-muted">
                Per AGENT.md Point 3, seller verification requires trade license or NID review and is strictly independent from the Mart badge.
              </p>
            </div>

            {/* Verification Status Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                currentStore.verificationStatus === "VERIFIED"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : currentStore.verificationStatus === "PENDING"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-slate-50 border-slate-300 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <b className="text-sm block">Status: {currentStore.verificationStatus}</b>
                  <span className="text-[11px] block text-muted">
                    {currentStore.verificationNote || "No verification review notes yet."}
                  </span>
                </div>
              </div>

              {currentStore.verificationStatus === "VERIFIED" && <VerifiedBadge size="md" />}
            </div>

            {/* Document Submission Form */}
            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-dark block">
                    Trade License Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={tradeLicense}
                    onChange={(e) => setTradeLicense(e.target.value)}
                    placeholder="e.g. TRAD/DSCC/019284/2024"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/30 text-dark outline-none focus:border-deep font-mono"
                  />
                  <span className="text-[10px] text-muted">
                    Issued by City Corporation / Union Parishad.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-dark block">
                    National ID (NID) Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    placeholder="e.g. 19942691234567890"
                    className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/30 text-dark outline-none focus:border-deep font-mono"
                  />
                  <span className="text-[10px] text-muted">
                    10-digit Smart NID or 17-digit biometric NID.
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark block">
                  Additional Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder="Mention registered business address, authorized person, or tax TIN…"
                  className="w-full px-3 py-2.5 rounded-xl border border-border-gold bg-cream/30 text-dark outline-none focus:border-deep"
                />
              </div>

              <button
                type="submit"
                className="gbtn px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
              >
                Submit Documents for Review
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-border-gold rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-border-gold/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-dark">
                {editingProductId ? "Edit Store Product" : "Launch New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="text-muted hover:text-dark p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-dark block">Product Title *</label>
                <input
                  required
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Sculptural Boucle Lounge Chair"
                  className="w-full p-2.5 rounded-xl border border-border-gold outline-none focus:border-deep"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-dark block">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Decor">Decor</option>
                    <option value="Ceramics">Ceramics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-dark block">Price (৳) *</label>
                  <input
                    required
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-dark block">Original (৳)</label>
                  <input
                    type="number"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-dark block">Stock Units</label>
                  <input
                    required
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-dark block">Sizes</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="Standard, Large"
                    className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-dark block">Colors</label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    placeholder="Beige, Charcoal"
                    className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                  />
                </div>
              </div>

              {/* Image Picker with Presets */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">Image URL *</label>
                <input
                  required
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep font-mono text-[11px]"
                />

                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {LUXURY_IMAGE_PRESETS.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setProdImage(img.url)}
                      className={`p-1 rounded-lg border text-left cursor-pointer transition ${
                        prodImage === img.url ? "border-deep ring-2 ring-deep/30" : "border-border-gold"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-12 object-cover rounded-md"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark block">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border-gold outline-none focus:border-deep"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border-gold text-muted hover:text-dark cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gbtn px-5 py-2 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer shadow-xs"
                >
                  {editingProductId ? "Update Product" : "Publish to Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SELLER SUBSCRIPTION RENEWAL (৳150/mo) */}
      {subscriptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border-gold rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border-gold/50 pb-2">
              <h3 className="font-serif text-lg font-bold text-dark">
                PREMILY Seller Plan
              </h3>
              <button
                type="button"
                onClick={() => setSubscriptionModalOpen(false)}
                className="text-muted hover:text-dark p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-cream/60 border border-border-gold space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-dark">Monthly Fee</span>
                <b className="font-serif text-lg text-deep">৳150 / mo</b>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Zero sales commissions. Unlimited products, custom storefront branding, and direct 64-district fulfillment.
              </p>
            </div>

            <form onSubmit={handleRenewSubscription} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-dark block">
                  Select MFS Gateway:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl border border-deep bg-cream/30 text-center font-bold text-[#E2136E]">
                    bKash Merchant
                  </div>
                  <div className="p-2 rounded-xl border border-border-gold bg-cream/30 text-center font-bold text-[#F7941D]">
                    Nagad Direct
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-dark block">
                  MFS Transaction ID (TrxID)
                </label>
                <input
                  required
                  type="text"
                  value={mfsTrxId}
                  onChange={(e) => setMfsTrxId(e.target.value)}
                  placeholder="e.g. BK89X42L9A"
                  className="w-full p-2.5 rounded-xl border border-border-gold outline-none focus:border-deep font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={subscriptionRenewing}
                className="gbtn w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {subscriptionRenewing ? "Verifying Payment…" : "Pay ৳150 & Renew 30 Days"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
