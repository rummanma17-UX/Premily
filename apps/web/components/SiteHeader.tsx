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
  Sparkles,
} from "lucide-react";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";
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
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("premily_user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    loadUser();
    const handleCartUpdate = () => setCartCount(CartService.getItemCount());
    const initialCartSync = window.setTimeout(handleCartUpdate, 0);
    window.addEventListener("premily_auth_change", loadUser);
    window.addEventListener("premily_cart_change", handleCartUpdate);
    window.addEventListener("storage", loadUser);

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
      window.clearTimeout(initialCartSync);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("premily_user");
      document.cookie = "premily_user_token=; path=/; max-age=0";
      setUser(null);
      setMenuOpen(false);
      window.dispatchEvent(new Event("premily_auth_change"));
    } catch {
      // silent
    }
  };

  const handleSwitchRole = (newRole: "CUSTOMER" | "SELLER" | "ADMIN") => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    localStorage.setItem("premily_user", JSON.stringify(updated));
    setUser(updated);
    window.dispatchEvent(new Event("premily_auth_change"));
    setMenuOpen(false);
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

          {/* Location Selector (Desktop/Tablet) */}
          <button
            type="button"
            className="hidden cursor-pointer items-center gap-2 rounded-xl border border-gold/40 px-3 py-1.5 hover:bg-cream md:flex transition"
            aria-label="Delivery location: Dhaka, estimated one to two days"
          >
            <MapPin className="size-5 text-deep" aria-hidden="true" />
            <span className="text-left leading-tight">
              <span className="block text-[10px] text-muted">Deliver to</span>
              <span className="block text-sm font-semibold text-dark">Dhaka · 1–2 days</span>
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

                    {/* Quick Demo Switch Role */}
                    <div className="px-4 py-2 border-t border-border-gold/50 bg-surface-subtle">
                      <div className="text-[10px] uppercase font-bold text-muted mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-gold" />
                        <span>Switch Demo Role:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSwitchRole("CUSTOMER")}
                          className={`py-1 px-1 rounded-md font-semibold cursor-pointer border ${
                            user.role === "CUSTOMER"
                              ? "bg-dark text-white border-dark"
                              : "bg-white text-dark border-border-gold hover:border-deep"
                          }`}
                        >
                          Shopper
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchRole("SELLER")}
                          className={`py-1 px-1 rounded-md font-semibold cursor-pointer border ${
                            user.role === "SELLER"
                              ? "bg-dark text-white border-dark"
                              : "bg-white text-dark border-border-gold hover:border-deep"
                          }`}
                        >
                          Seller
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchRole("ADMIN")}
                          className={`py-1 px-1 rounded-md font-semibold cursor-pointer border ${
                            user.role === "ADMIN"
                              ? "bg-dark text-white border-dark"
                              : "bg-white text-dark border-border-gold hover:border-deep"
                          }`}
                        >
                          Admin
                        </button>
                      </div>
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
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 border border-border-gold rounded-xl px-2.5 py-1.5 hover:border-deep hover:bg-cream/40 transition text-xs font-semibold text-dark cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

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
        <div className="flex w-full items-center gap-1 bg-cream px-4 py-2 text-xs md:hidden border-t border-border-gold/40 text-muted">
          <MapPin className="size-3.5 text-deep" aria-hidden="true" />
          <span>Deliver to:</span> <b className="text-dark">Dhaka (1–2 days) · ৳70</b>
        </div>
      </header>

      {/* Cart Drawer Slide-Over */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />

      {/* Google Login Modal triggered from header */}
      <GoogleLoginModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        defaultRole="CUSTOMER"
      />
    </>
  );
}
