"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  ArrowRight,
  Store,
} from "lucide-react";
import { CartService, type CartItem, type StoreCartGroup } from "@/lib/cart-service";
import { MartBadge } from "../badges/MartBadge";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [storeData, setStoreData] = useState(() => CartService.getStoreGroups("Dhaka"));
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = () => {
    setStoreData(CartService.getStoreGroups("Dhaka"));
    setCartCount(CartService.getItemCount());
  };

  useEffect(() => {
    refreshCart();
    const handleCartChange = () => refreshCart();
    window.addEventListener("premily_cart_change", handleCartChange);
    return () => window.removeEventListener("premily_cart_change", handleCartChange);
  }, []);

  if (!isOpen) return null;

  const { groups, totalSubtotal, totalShipping, grandTotal } = storeData;
  const isEmpty = groups.length === 0 || groups.every((g) => g.items.length === 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-border-gold animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-border-gold/60 flex items-center justify-between bg-cream/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-deep" />
              <h2 className="font-serif text-lg font-bold text-dark">
                Shopping Cart
              </h2>
              <span className="text-xs bg-dark text-white rounded-full px-2 py-0.5 font-semibold">
                {cartCount}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-muted hover:text-dark hover:bg-cream transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isEmpty ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream border border-border-gold flex items-center justify-center mx-auto text-deep">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-dark text-base">Your cart is empty</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    Explore curated architectural decor and boutique storefront collections on PREMILY.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-block gbtn px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {groups.map((group) => (
                  <div
                    key={group.storeId}
                    className="rounded-2xl border border-border-gold bg-surface-subtle overflow-hidden"
                  >
                    {/* Per-Store Group Header (AGENT.md Rule 5) */}
                    <div className="p-3 bg-cream/60 border-b border-border-gold/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-dark truncate">
                        <Store className="w-3.5 h-3.5 text-deep shrink-0" />
                        <span className="font-semibold">{group.storeName}</span>
                        {group.isPremilyMart && <MartBadge size="sm" />}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted shrink-0">
                        <Truck className="w-3 h-3 text-deep" />
                        <span>Ship: {formatTaka(group.shippingCost)}</span>
                      </div>
                    </div>

                    {/* Group Items */}
                    <div className="p-3 space-y-3 divide-y divide-border-gold/30">
                      {group.items.map((item) => (
                        <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border border-border-gold shrink-0 bg-white"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-dark truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-muted truncate">
                              {item.variantLabel}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="font-serif font-bold text-xs text-deep">
                                {formatTaka(item.price)}
                              </span>

                              {/* Quantity Controls */}
                              <div className="flex items-center border border-border-gold rounded-lg bg-white overflow-hidden text-xs">
                                <button
                                  type="button"
                                  onClick={() =>
                                    CartService.updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="px-2 py-0.5 text-muted hover:text-dark hover:bg-cream"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 py-0.5 font-semibold text-dark min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    CartService.updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="px-2 py-0.5 text-muted hover:text-dark hover:bg-cream"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => CartService.removeFromCart(item.id)}
                            className="text-gray-400 hover:text-rose-600 p-1 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer Summary */}
          {!isEmpty && (
            <div className="p-6 border-t border-border-gold bg-cream/40 space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-dark">{formatTaka(totalSubtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Estimated Delivery ({groups.length} {groups.length > 1 ? "Stores" : "Store"}):</span>
                  <span className="font-semibold text-dark">{formatTaka(totalShipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-dark pt-2 border-t border-border-gold/50">
                  <span>Total Payable:</span>
                  <span className="font-serif text-base text-deep">{formatTaka(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3 rounded-full gbtn font-semibold text-xs text-center shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-[11px] text-muted hover:text-dark transition text-center"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
