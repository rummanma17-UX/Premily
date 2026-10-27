"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  Truck,
  RefreshCw,
  Radio,
  CheckCircle2,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Play,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import {
  StoreService,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/store-data";
import {
  generateDeliveryTracking,
  type CourierTrackingData,
  ORDER_STEP_KEYS,
  getStepIndex,
} from "@/lib/delivery-tracking";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

const STEP_LABELS: Record<OrderStatus, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed by Merchant",
  PROCESSING: "Packed & Consigned",
  SHIPPED: "In Transit with Courier",
  DELIVERED: "Delivered to Doorstep",
  CANCELLED: "Cancelled",
};

export function RealtimeOrderTracker() {
  const [orders, setOrders] = useState<OrderRecord[]>(() => StoreService.getOrders());
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DELIVERED">("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedConsignment, setCopiedConsignment] = useState<string | null>(null);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  
  // Real-time polling & synchronization state
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(() => new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [, startTransition] = useTransition();

  // Load and refresh orders from StoreService and optional tracking endpoint
  const syncLatestOrders = useCallback((isManual = false) => {
    setIsSyncing(true);
    startTransition(() => {
      try {
        const freshOrders = StoreService.getOrders();
        
        // Detect status differences to notify user of live progress
        setOrders((prev) => {
          if (prev.length > 0 && freshOrders.length > 0) {
            for (const fresh of freshOrders) {
              const matched = prev.find((p) => p.id === fresh.id);
              if (matched && matched.orderStatus !== fresh.orderStatus) {
                setRecentNotification(
                  `Order #${fresh.orderNumber} transitioned to: ${STEP_LABELS[fresh.orderStatus]}`
                );
                // Auto dismiss after 6 seconds
                setTimeout(() => setRecentNotification(null), 6000);
              }
            }
          }
          return freshOrders;
        });

        setLastSyncedTime(new Date());
        setSecondsAgo(0);
      } catch (err) {
        console.error("Failed to sync orders in real-time:", err);
      } finally {
        setTimeout(() => setIsSyncing(false), isManual ? 400 : 200);
      }
    });
  }, []);

  // Event-based Realtime Mechanism: Listen to local events and cross-tab storage
  useEffect(() => {
    const handleDataChange = () => {
      syncLatestOrders();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "premily_orders_data") {
        syncLatestOrders();
      }
    };

    window.addEventListener("premily_data_change", handleDataChange);
    window.addEventListener("premily_order_created", handleDataChange);
    window.addEventListener("premily_order_updated", handleDataChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("premily_data_change", handleDataChange);
      window.removeEventListener("premily_order_created", handleDataChange);
      window.removeEventListener("premily_order_updated", handleDataChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [syncLatestOrders]);

  // Polling Mechanism: Run periodic check every 5 seconds (with pause when tab is inactive)
  useEffect(() => {
    if (!isPollingActive) return;

    const interval = setInterval(() => {
      // Don't poll aggressively when browser tab is hidden to conserve resources
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      syncLatestOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPollingActive, syncLatestOrders]);

  // Relative seconds counter for live synchronization badge
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastSyncedTime) {
        const diff = Math.floor((Date.now() - lastSyncedTime.getTime()) / 1000);
        setSecondsAgo(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSyncedTime]);

  // Advance order status to simulate live courier scanning
  const handleSimulateAdvanceStatus = (order: OrderRecord) => {
    const currentIndex = getStepIndex(order.orderStatus);
    const nextIndex = (currentIndex + 1) % ORDER_STEP_KEYS.length;
    const nextStatus = ORDER_STEP_KEYS[nextIndex];

    const partners = ["Steadfast", "Pathao", "RedX", "Paperfly"] as const;
    const partner = order.courierPartner || partners[nextIndex % partners.length];
    const orderNumDigits = order.orderNumber.replace(/[^0-9]/g, "") || "98214";
    const consignmentId = order.consignmentId || `ST-${orderNumDigits}-BD`;

    StoreService.updateOrderStatus(order.id, nextStatus, {
      partner,
      consignmentId,
    });
  };

  const handleCopyConsignment = (consignmentId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(consignmentId);
      setCopiedConsignment(consignmentId);
      setTimeout(() => setCopiedConsignment(null), 2500);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ACTIVE") return o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED";
    if (filter === "DELIVERED") return o.orderStatus === "DELIVERED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Real-time Status & Sync Bar */}
      <div className="premily-card p-4 sm:p-5 rounded-3xl border border-border-gold bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isPollingActive ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                <span className="w-3 h-3 rounded-full bg-emerald-600 relative inline-block" />
              </>
            ) : (
              <span className="w-3 h-3 rounded-full bg-muted/60 relative inline-block" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-dark tracking-wide uppercase font-serif">
                {isPollingActive ? "Live Courier Tracking Active" : "Live Polling Paused"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-deep font-semibold border border-border-gold">
                5s Interval + Event Stream
              </span>
            </div>
            <p className="text-[11px] text-muted">
              {lastSyncedTime ? (
                <>
                  Last synced:{" "}
                  <span className="font-medium text-dark">
                    {secondsAgo === 0 ? "Just now" : `${secondsAgo}s ago`}
                  </span>{" "}
                  ({orders.length} total orders monitored across Bangladesh)
                </>
              ) : (
                "Connecting to courier tracking stream..."
              )}
            </p>
          </div>
        </div>

        {/* Sync Controls & Simulation Helper */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setIsPollingActive((prev) => !prev)}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              isPollingActive
                ? "bg-cream text-dark border-border-gold hover:border-deep"
                : "bg-surface-subtle text-muted border-border-gold"
            }`}
            title="Toggle background delivery polling"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isPollingActive ? "Polling: On" : "Polling: Off"}</span>
          </button>

          <button
            type="button"
            onClick={() => syncLatestOrders(true)}
            disabled={isSyncing}
            className="text-xs px-3.5 py-1.5 rounded-xl font-semibold bg-dark text-light-gold border border-dark hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            title="Perform immediate manual sync with local and courier state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* Live Status Transition Banner Notification */}
      {recentNotification && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cream via-white to-cream border border-gold/50 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-deep animate-bounce" />
            </div>
            <span className="text-xs font-semibold text-dark">
              {recentNotification}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRecentNotification(null)}
            className="text-[11px] text-muted hover:text-dark font-medium underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(["ALL", "ACTIVE", "DELIVERED"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer border ${
              filter === tab
                ? "bg-dark text-light-gold border-dark"
                : "bg-surface-subtle text-dark border-border-gold hover:border-deep"
            }`}
          >
            {tab === "ALL"
              ? `All Orders (${orders.length})`
              : tab === "ACTIVE"
              ? `In Transit / Active (${orders.filter((o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED").length})`
              : `Delivered (${orders.filter((o) => o.orderStatus === "DELIVERED").length})`}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="premily-card p-12 text-center rounded-3xl border border-border-gold bg-white space-y-3">
          <Package className="w-12 h-12 text-muted/40 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-dark">
            No orders found in this view
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            You haven&apos;t placed any orders matching this filter yet. Explore our curated artisan living collections.
          </p>
          <Link
            href="/products"
            className="gbtn inline-block px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const tracking: CourierTrackingData = generateDeliveryTracking(order);
            const currentStep = getStepIndex(order.orderStatus);
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="premily-card p-5 sm:p-6 rounded-3xl border border-border-gold bg-white shadow-sm space-y-5 transition-all hover:border-gold/60"
              >
                {/* Header Meta Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-gold/40 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-base text-dark">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-deep bg-cream px-2 py-0.5 rounded-full border border-border-gold">
                        {order.storeName}
                      </span>
                      {order.courierPartner && (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {order.courierPartner} Express
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted block mt-0.5">
                      Booked on {new Date(order.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <b className="font-serif text-lg text-deep block">
                        {formatTaka(order.total)}
                      </b>
                      <span className="text-[10px] text-muted font-medium">
                        {order.paymentMethod === "CASH_ON_DELIVERY"
                          ? "Cash on Delivery"
                          : `${order.paymentMethod} (${order.paymentStatus})`}
                      </span>
                    </div>

                    {/* Quick Simulation Trigger for Testers */}
                    <button
                      type="button"
                      onClick={() => handleSimulateAdvanceStatus(order)}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-cream hover:bg-gold/20 text-dark border border-border-gold hover:border-gold transition flex items-center gap-1 cursor-pointer shrink-0"
                      title="Advance order status to test real-time update mechanics"
                    >
                      <Play className="w-2.5 h-2.5 fill-current text-deep" />
                      <span>Simulate Next Step</span>
                    </button>
                  </div>
                </div>

                {/* 5-Step Delivery Progression Bar */}
                {order.orderStatus !== "CANCELLED" && (
                  <div className="py-2 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-dark flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-deep" />
                        <span>Current Stage:</span>
                        <span className="text-deep font-bold">
                          {STEP_LABELS[order.orderStatus]}
                        </span>
                      </span>

                      {tracking.consignmentId && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
                          <span>CN: {tracking.consignmentId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyConsignment(tracking.consignmentId)}
                            className="p-1 hover:text-dark rounded transition cursor-pointer"
                            title="Copy consignment number"
                          >
                            {copiedConsignment === tracking.consignmentId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar & Stepper Nodes */}
                    <div className="relative pt-1 pb-2">
                      {/* Connecting Line Track */}
                      <div className="absolute top-4 left-4 right-4 h-1 bg-border-gold/60 -z-0 rounded-full" />
                      <div
                        className="absolute top-4 left-4 h-1 bg-gradient-to-r from-deep to-light-gold rounded-full transition-all duration-700 ease-out -z-0"
                        style={{
                          width: `${(Math.max(0, currentStep) / (ORDER_STEP_KEYS.length - 1)) * 95}%`,
                        }}
                      />

                      {/* Step Nodes */}
                      <div className="relative flex justify-between z-10">
                        {ORDER_STEP_KEYS.map((stepKey, idx) => {
                          const isDone = idx <= currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div
                              key={stepKey}
                              className="flex flex-col items-center text-center max-w-[80px]"
                            >
                              <div
                                className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold border transition duration-300 ${
                                  isDone
                                    ? "bg-dark text-light-gold border-gold shadow-sm"
                                    : "bg-white text-muted border-border-gold"
                                } ${
                                  isCurrent
                                    ? "ring-4 ring-deep/30 scale-110 animate-pulse"
                                    : ""
                                }`}
                              >
                                {isDone ? (
                                  idx === 4 ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-light-gold" />
                                  ) : (
                                    "✓"
                                  )
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <span
                                className={`text-[9px] mt-1.5 leading-tight ${
                                  isCurrent
                                    ? "font-bold text-dark underline decoration-gold underline-offset-2"
                                    : isDone
                                    ? "font-semibold text-dark/80"
                                    : "text-muted"
                                }`}
                              >
                                {STEP_LABELS[stepKey]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expandable Live Courier Checkpoints Drawer */}
                <div className="pt-2 border-t border-border-gold/30">
                  <button
                    type="button"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between text-xs text-muted hover:text-dark font-medium py-1 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-deep" />
                      <span>
                        {isExpanded ? "Hide Detailed Courier Transit Log" : "View Live Courier Milestones & Dispatch Details"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-deep">
                      {isExpanded ? (
                        <>
                          Less <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Track Live Checkpoints <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 p-4 rounded-2xl bg-cream/30 border border-border-gold space-y-4 animate-in fade-in duration-200">
                      {/* Courier Partner & Window Banner */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-border-gold/40 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                            Assigned Logistics Partner
                          </span>
                          <b className="text-dark font-serif text-sm">
                            {tracking.courierPartner} Express Bangladesh
                          </b>
                          <span className="text-[11px] text-muted block">
                            Consignment ID: <span className="font-mono font-semibold text-dark">{tracking.consignmentId}</span>
                          </span>
                        </div>

                        <div className="text-left sm:text-right space-y-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                            Estimated Delivery Window
                          </span>
                          <span className="text-deep font-semibold block">
                            {tracking.estimatedDeliveryWindow}
                          </span>
                          <span className="text-[10px] text-muted block">
                            Delivery to {order.shippingDistrict}
                          </span>
                        </div>
                      </div>

                      {/* Milestone List */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-dark uppercase tracking-wider block">
                          Consignment Transit Milestones
                        </span>
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-gold">
                          {tracking.milestones.map((m) => (
                            <div key={m.id} className="relative">
                              {/* Milestone dot */}
                              <div
                                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 grid place-items-center ${
                                  m.isCompleted
                                    ? "bg-deep border-white ring-2 ring-gold/40"
                                    : "bg-white border-border-gold"
                                }`}
                              >
                                {m.isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>

                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`text-xs ${
                                      m.isCurrent
                                        ? "font-bold text-deep"
                                        : m.isCompleted
                                        ? "font-semibold text-dark"
                                        : "text-muted"
                                    }`}
                                  >
                                    {m.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-muted shrink-0">
                                    {m.timestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted mt-0.5">
                                  {m.description}
                                </p>
                                <span className="text-[10px] text-dark/70 font-medium block mt-0.5">
                                  📍 {m.location}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rider Contact Card if available */}
                      {tracking.riderName && (
                        <div className="p-3 rounded-xl bg-white border border-border-gold flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cream border border-border-gold flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-deep" />
                            </div>
                            <div>
                              <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
                                Assigned Courier Rider
                              </span>
                              <b className="text-dark block">{tracking.riderName}</b>
                            </div>
                          </div>

                          {tracking.riderPhone && (
                            <a
                              href={`tel:${tracking.riderPhone}`}
                              className="px-3 py-1.5 rounded-lg bg-dark text-light-gold text-[11px] font-semibold flex items-center gap-1.5 hover:brightness-110 transition"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{tracking.riderPhone}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ordered Items Preview */}
                <div className="space-y-2 pt-2 border-t border-border-gold/30">
                  <span className="text-[11px] font-semibold text-muted block">
                    Ordered Products ({order.items.length})
                  </span>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-cream/30"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border-gold shrink-0"
                        />
                        <div>
                          <span className="font-bold text-dark text-xs block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-muted">
                            {item.variantLabel} · Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <b className="text-xs font-semibold text-dark">
                        {formatTaka(item.price * item.quantity)}
                      </b>
                    </div>
                  ))}
                </div>

                {/* Destination & Logistics Fee */}
                <div className="p-3 rounded-2xl bg-cream/40 border border-border-gold flex flex-col sm:flex-row justify-between gap-3 text-xs">
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold">
                      Delivery Destination
                    </span>
                    <b className="text-dark block">
                      {order.customerName} ({order.customerPhone})
                    </b>
                    <span className="text-muted text-[11px] block">
                      {order.shippingAddress}, {order.shippingDistrict}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-muted block text-[10px] uppercase font-bold">
                      Courier Logistics
                    </span>
                    <span className="font-semibold text-dark block">
                      ৳{order.shippingCost} (
                      {order.shippingDistrict.toLowerCase() === "dhaka"
                        ? "Inside Dhaka · 1–2 days"
                        : "Outside Dhaka · 3–5 days"}
                      )
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
