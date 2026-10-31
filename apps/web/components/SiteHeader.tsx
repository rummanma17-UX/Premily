"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Languages,
  MapPin,
  Search,
  ShoppingCart,
  UserRound,
  LogOut,
  Store,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { DistrictShippingInfo } from "@/types";
import { CartService } from "@/lib/cart-service";
import { CartDrawer } from "@/components/cart/CartDrawer";

type AuthUser = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: "CUSTOMER" | "SELLER" | "ADMIN";
  avatar?: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [districts, setDistricts] = useState<DistrictShippingInfo[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiFetch<{ user: AuthUser }>("/api/auth/me");
        setUser(data.user);
        localStorage.setItem("premily_user", JSON.stringify(data.user));
      } catch {
        setUser(null);
        localStorage.removeItem("premily_user");
      }
    };

    void loadUser();
    const savedDistrict = localStorage.getItem("premily_delivery_district");
    if (savedDistrict) setSelectedDistrict(savedDistrict);
    apiFetch<DistrictShippingInfo[]>("/api/shipping/districts")
      .then((records) => {
        setDistricts(records);
        const saved = localStorage.getItem("premily_delivery_district");
        if (saved && !records.some((district) => district.districtName === saved)) {
          localStorage.removeItem("premily_delivery_district");
          setSelectedDistrict("Dhaka");
        }
      })
      .catch((error) => console.error("Unable to load delivery districts:", error));
    const handleCartUpdate = () => setCartCount(CartService.getItemCount());
    const initialCartSync = window.setTimeout(handleCartUpdate, 0);
    window.addEventListener("premily_auth_change", loadUser);
    window.addEventListener("premily_cart_change", handleCartUpdate);
    window.addEventListener("storage", loadUser);
    const syncDeliveryDistrict = () => {
      setSelectedDistrict(localStorage.getItem("premily_delivery_district") || "Dhaka");
    };
    window.addEventListener("premily_delivery_change", syncDeliveryDistrict);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("premily_auth_change", loadUser);
      window.removeEventListener("premily_cart_change", handleCartUpdate);
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("premily_delivery_change", syncDeliveryDistrict);
      window.clearTimeout(initialCartSync);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    } catch {
      // The session may already have expired; clear the local display state anyway.
    }
    localStorage.removeItem("premily_user");
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("premily_auth_change"));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface shadow-xs border-b border-border-gold/40">
        {/* Top utility bar */}
        <div className="bg-dark text-cream text-[11px] py-1 px-4 border-b border-gold/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-light-gold hidden sm:inline">
                PREMILY · Seller-Focused Architectural E-Commerce Bangladesh
              </span>
              <span className="text-cream/70">
                Inside Dhaka: ৳70 (1–2 days) · Outside Dhaka: ৳150 (3–5 days)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/seller"
                className="text-light-gold hover:text-gold flex items-center gap-1 font-semibold transition"
              >
                <Store className="w-3 h-3 text-gold" />
                <span>Seller Center</span>
              </Link>
              <span className="text-gold/40">|</span>
              <Link
                href="/admin"
                className="text-cream/80 hover:text-gold flex items-center gap-1 transition"
              >
                <SlidersHorizontal className="w-3 h-3 text-gold" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-6">
          {/* Brand Logo */}
          <Link
            href="/"
            aria-label="PREMILY home"
            className="font-serif text-2xl font-bold tracking-widest text-dark shrink-0"
          >
            PREMILY<span className="text-deep">.</span>
          </Link>

          {/* Mobile Language Toggle */}
          <button
            type="button"
            className="ml-auto flex cursor-pointer items-center gap-1 rounded-full border border-gold/60 px-3 py-1 text-xs sm:hidden text-dark"
            aria-label="Choose language"
          >
            <Languages className="size-3.5 text-deep" aria-hidden="true" />
            বাংলা
          </button>

          {/* Delivery district selector */}
          <button type="button" onClick={() => setDeliveryOpen((open) => !open)}
            aria-expanded={deliveryOpen} aria-label="Choose delivery district"
            className="hidden cursor-pointer items-center gap-2 rounded-xl border border-gold/40 px-3 py-1.5 transition hover:bg-cream md:flex">
            <MapPin className="size-5 text-deep" aria-hidden="true" />
            <span className="text-left leading-tight">
              <span className="block text-[10px] text-muted">Deliver to</span>
              <span className="block text-sm font-semibold text-dark">{selectedDistrict} <ChevronDown className="ml-1 inline size-3" /></span>
            </span>
          </button>

          {/* Marketplace Search Form */}
          <form
            action="/products"
            method="get"
            role="search"
            className="order-last flex w-full min-w-0 overflow-hidden rounded-full border-2 border-gold bg-surface sm:order-none sm:w-auto sm:flex-1"
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <span className="hidden items-center border-r border-gold/40 bg-cream px-4 text-xs sm:flex text-muted font-medium">
              All Stores
            </span>
            <input
              id="site-search"
              name="q"
              type="search"
              className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none text-dark bg-white"
              placeholder="Search luxury furniture, decor, lighting…"
            />
            <button
              type="submit"
              className="gbtn grid place-items-center px-5 cursor-pointer"
              aria-label="Search"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
          </form>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-border-gold hover:border-deep bg-cream/30 hover:bg-cream/60 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-deep text-white font-bold grid place-items-center text-xs shrink-0 shadow-xs">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block max-w-[100px] truncate text-xs font-bold text-dark leading-tight">
                      {user.name}
                    </span>
                    <span className="block text-[9px] font-semibold text-deep uppercase tracking-wider">
                      {user.role || "CUSTOMER"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-border-gold rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-border-gold/50 bg-cream/40">
                      <div className="font-bold text-dark truncate">{user.name}</div>
                      <div className="text-[11px] text-muted truncate">
                        {user.email || user.phone}
                      </div>
                      {user.phone && (
                        <div className="text-[10px] text-deep font-mono mt-0.5">
                          BD: {user.phone}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      {user.role === "SELLER" && (
                        <>
                          <Link
                            href="/seller"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-cream text-dark font-medium"
                          >
                            <Store className="w-4 h-4 text-deep" />
                            <span>Seller Operations Panel</span>
                          </Link>
                          <Link
                            href="/aura-home"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-cream text-dark"
                          >
                            <ExternalLink className="w-4 h-4 text-muted" />
                            <span>My Dedicated Storefront</span>
                          </Link>
                        </>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-cream text-dark font-medium"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-deep" />
                          <span>PREMILY Superadmin Panel</span>
                        </Link>
                      )}

                      <Link
                        href="/account/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-cream text-dark"
                      >
                        <ShoppingBag className="w-4 h-4 text-muted" />
                        <span>My Order History</span>
                      </Link>

                      <Link
                        href="/checkout"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-cream text-dark"
                      >
                        <ShoppingCart className="w-4 h-4 text-muted" />
                        <span>Checkout & Delivery</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-border-gold/40">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-dark hover:text-deep transition py-1.5 px-2.5 rounded-xl border border-transparent hover:border-border-gold hover:bg-cream"
                >
                  <UserRound className="size-4 sm:size-5 text-deep" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden font-semibold">Login</span>
                </Link>
              </div>
            )}

            {/* Cart Icon Button */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Shopping cart"
              className="relative p-2 hover:text-deep transition text-dark cursor-pointer"
            >
              <ShoppingCart className="size-5 sm:size-6" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="gbtn absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-header District Delivery Notice for Mobile */}
        <button type="button" onClick={() => setDeliveryOpen((open) => !open)}
          aria-expanded={deliveryOpen}
          className="flex w-full items-center gap-1 border-t border-border-gold/40 bg-cream px-4 py-2 text-left text-xs text-muted md:hidden">
          <MapPin className="size-3.5 text-deep" aria-hidden="true" />
          <span>Deliver to:</span><b className="text-dark">{selectedDistrict}</b>
          <ChevronDown className="size-3 text-deep" />
        </button>
        {deliveryOpen && (
          <div className="absolute left-4 right-4 top-full z-50 rounded-xl border border-border-gold bg-white p-4 shadow-xl md:left-44 md:right-auto md:w-80">
            <label htmlFor="header-delivery-district" className="mb-2 block text-xs font-semibold text-dark">Select delivery district</label>
            <select id="header-delivery-district" value={selectedDistrict}
              onChange={(event) => {
                const district = event.target.value;
                setSelectedDistrict(district);
                localStorage.setItem("premily_delivery_district", district);
                setDeliveryOpen(false);
              }}
              className="w-full cursor-pointer rounded-xl border border-border-gold bg-cream/50 px-3 py-2.5 text-sm text-dark outline-none focus:border-deep">
              {districts.map((district) => <option key={district.districtName} value={district.districtName}>{district.districtName} · {district.division}</option>)}
            </select>
            {districts.length === 0 && <p className="mt-2 text-[11px] text-muted">Loading available districts…</p>}
            {districts.find((district) => district.districtName === selectedDistrict) && (
              <p className="mt-2 text-[11px] text-muted">
                Estimated delivery: {districts.find((district) => district.districtName === selectedDistrict)!.estimatedDaysMin}–{districts.find((district) => district.districtName === selectedDistrict)!.estimatedDaysMax} days · ৳{Number(districts.find((district) => district.districtName === selectedDistrict)!.baseCost).toLocaleString("en-BD")}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer Slide-Over */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />

    </>
  );
}
