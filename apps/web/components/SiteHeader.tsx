"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Languages,
  MapPin,
  Search,
  ShoppingCart,
  UserRound,
  LogOut,
  Store,
} from "lucide-react";

type AuthUser = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: "CUSTOMER" | "SELLER" | "ADMIN";
};

export function SiteHeader() {
  const [user, setUser] = useState<AuthUser | null>(null);

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
    window.addEventListener("premily_auth_change", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("premily_auth_change", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("premily_user");
      setUser(null);
      window.dispatchEvent(new Event("premily_auth_change"));
    } catch {
      // silent
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-xs border-b border-border-gold/40">
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
            All
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

        {/* Authentication Navigation Link / User Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === "SELLER" ? "/seller" : "/checkout"}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-deep transition"
                title={user.name}
              >
                <div className="w-7 h-7 rounded-full bg-cream border border-border-gold grid place-items-center text-xs font-bold text-deep shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate text-dark font-medium">
                  {user.name}
                </span>
                {user.role === "SELLER" && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                    <Store className="w-3 h-3" />
                    Vendor
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-muted hover:text-rose-600 p-1.5 rounded-lg hover:bg-cream transition cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-dark hover:text-deep transition py-1 px-2 rounded-lg hover:bg-cream"
            >
              <UserRound className="size-4 sm:size-5 text-deep" aria-hidden="true" />
              <span className="hidden sm:inline">Login / Sign up</span>
              <span className="sm:hidden font-semibold">Login</span>
            </Link>
          )}

          {/* Cart Icon Link */}
          <Link
            href="/checkout"
            aria-label="Shopping cart, 1 item"
            className="relative p-2 hover:text-deep transition text-dark"
          >
            <ShoppingCart className="size-5 sm:size-6" aria-hidden="true" />
            <span className="gbtn absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full text-[10px] font-bold">
              1
            </span>
          </Link>
        </div>
      </div>

      {/* Sub-header District Delivery Notice for Mobile */}
      <div className="flex w-full items-center gap-1 bg-cream px-4 py-2 text-xs md:hidden border-t border-border-gold/40 text-muted">
        <MapPin className="size-3.5 text-deep" aria-hidden="true" />
        <span>Deliver to:</span> <b className="text-dark">Dhaka (1–2 days) · ৳70</b>
      </div>
    </header>
  );
}
