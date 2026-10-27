"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { RealtimeOrderTracker } from "@/components/orders/RealtimeOrderTracker";

export default function CustomerOrdersPage() {
  return (
    <main className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-dark font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/products"
              className="text-muted hover:text-dark transition flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Link>
            <Link
              href="/checkout"
              className="text-deep hover:underline"
            >
              Checkout →
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark">
            My Order History & Real-Time Tracking
          </h1>
          <p className="text-xs text-muted">
            Live delivery updates across Bangladesh 64-districts with Steadfast, Pathao, RedX, and Paperfly logistics.
          </p>
        </div>

        {/* Real-time Tracking Component */}
        <RealtimeOrderTracker />
      </div>
    </main>
  );
}
