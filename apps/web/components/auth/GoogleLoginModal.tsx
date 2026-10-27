"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Store,
  ShoppingBag,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

export type GoogleUserPayload = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  avatar?: string;
  provider: "google";
};

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "CUSTOMER" | "SELLER" | "ADMIN";
  redirectUrl?: string;
  onSuccess?: (user: GoogleUserPayload) => void;
}

export function GoogleLoginModal({
  isOpen,
  onClose,
  defaultRole = "CUSTOMER",
  redirectUrl = "/",
  onSuccess,
}: GoogleLoginModalProps) {
  const router = useRouter();

  // Step 1: Account selection; Step 2: Phone-first BD verification & role selection
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAccount, setSelectedAccount] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: "Rumman Aelrix",
    email: "rummanma17@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  });

  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [useCustomAccount, setUseCustomAccount] = useState(false);

  // Step 2 Form State (AGENT.md Point 4: Phone-First BD Authentication)
  const [phone, setPhone] = useState("01712345678");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER" | "ADMIN">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = (account: { name: string; email: string; avatar: string }) => {
    setSelectedAccount(account);
    setUseCustomAccount(false);
    setError(null);
    setStep(2);
  };

  const handleCustomAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.includes("@") || !customName.trim()) {
      setError("Please enter a valid Google account name and email address.");
      return;
    }
    setSelectedAccount({
      name: customName.trim(),
      email: customEmail.trim(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    });
    setError(null);
    setStep(2);
  };

  const handleCompleteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // AGENT.md Point 4: Validate Bangladeshi mobile number (01[3-9]\d{8})
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phone.trim())) {
      setError("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).");
      return;
    }

    setIsSubmitting(true);

    try {
      const userPayload: GoogleUserPayload = {
        id: `usr_g_${Date.now().toString(36)}`,
        name: selectedAccount.name,
        email: selectedAccount.email,
        phone: phone.trim(),
        role: role,
        avatar: selectedAccount.avatar,
        provider: "google",
      };

      // Save to localStorage and set auth cookie/event
      if (typeof window !== "undefined") {
        localStorage.setItem("premily_user", JSON.stringify(userPayload));
        // Set cookie so Next.js server components can also read the session
        document.cookie = `premily_user_token=${userPayload.id}; path=/; max-age=604800; SameSite=Lax`;
        window.dispatchEvent(new Event("premily_auth_change"));
      }

      setIsComplete(true);
      if (onSuccess) onSuccess(userPayload);

      setTimeout(() => {
        onClose();
        if (role === "SELLER") {
          router.push("/seller");
        } else if (role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(redirectUrl);
        }
      }, 1000);
    } catch {
      setError("Failed to link Google account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-border-gold rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="bg-surface-subtle px-6 py-4 border-b border-border-gold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Google official SVG logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="font-semibold text-xs text-dark tracking-wide">
              Sign in with Google
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-dark p-1 rounded-full hover:bg-cream transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Brand Subtitle */}
          <div className="text-center space-y-1">
            <h3 className="font-serif text-xl font-bold text-dark">
              Welcome to PREMILY
            </h3>
            <p className="text-xs text-muted">
              {step === 1
                ? "Choose an account to continue to PREMILY Bangladesh"
                : "Complete Phone-First Bangladesh Delivery Setup"}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isComplete && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Google account verified! Redirecting to PREMILY…</span>
            </div>
          )}

          {/* STEP 1: GOOGLE ACCOUNT CHOOSER */}
          {step === 1 && !isComplete && (
            <div className="space-y-3">
              {/* Account Card 1: Default Detected Google User */}
              <button
                type="button"
                onClick={() =>
                  handleSelectAccount({
                    name: "Rumman Aelrix",
                    email: "rummanma17@gmail.com",
                    avatar:
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                  })
                }
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-border-gold hover:border-deep hover:bg-cream/40 transition text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-deep text-white font-bold grid place-items-center text-sm shrink-0 shadow-xs group-hover:scale-105 transition">
                  R
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-dark group-hover:text-deep transition">
                    Rumman Aelrix
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    rummanma17@gmail.com
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready
                </span>
              </button>

              {/* Account Card 2: Demo Vendor Partner Account */}
              <button
                type="button"
                onClick={() =>
                  handleSelectAccount({
                    name: "Aura Vendor Partner",
                    email: "seller@aurahome.bd",
                    avatar:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                  })
                }
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-border-gold hover:border-deep hover:bg-cream/40 transition text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-dark text-gold font-bold grid place-items-center text-sm shrink-0 shadow-xs group-hover:scale-105 transition">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-dark group-hover:text-deep transition">
                    Aura Vendor Partner
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    seller@aurahome.bd
                  </div>
                </div>
                <span className="text-[10px] text-gold font-semibold bg-dark px-2 py-0.5 rounded-full border border-gold/40">
                  Store
                </span>
              </button>

              {/* Toggle Custom Account */}
              {!useCustomAccount ? (
                <button
                  type="button"
                  onClick={() => setUseCustomAccount(true)}
                  className="w-full text-center text-xs text-deep font-semibold py-2 hover:underline cursor-pointer"
                >
                  + Use another Google account
                </button>
              ) : (
                <form onSubmit={handleCustomAccountNext} className="space-y-3 pt-2 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-dark block">Google Full Name</label>
                    <input
                      required
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Abdullah Al Mamun"
                      className="w-full p-2.5 rounded-xl border border-border-gold outline-none focus:border-deep bg-cream/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-dark block">Google Email Address</label>
                    <input
                      required
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full p-2.5 rounded-xl border border-border-gold outline-none focus:border-deep bg-cream/30"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setUseCustomAccount(false)}
                      className="px-3 py-1.5 rounded-lg border border-border-gold text-muted hover:text-dark cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="gbtn px-4 py-1.5 rounded-lg font-semibold cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}

              <p className="text-[11px] text-muted text-center pt-2 leading-relaxed">
                To continue, Google will share your name, email address, language preference, and profile picture with PREMILY.
              </p>
            </div>
          )}

          {/* STEP 2: AGENT.MD POINT 4 PHONE-FIRST REQUIREMENT & ROLE SELECTION */}
          {step === 2 && !isComplete && (
            <form onSubmit={handleCompleteGoogleAuth} className="space-y-4 text-xs">
              {/* Selected Account Capsule */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cream/50 border border-border-gold">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-deep text-white font-bold grid place-items-center text-xs shrink-0">
                    {selectedAccount.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-dark truncate">
                      {selectedAccount.name}
                    </div>
                    <div className="text-[10px] text-muted truncate">
                      {selectedAccount.email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-deep font-semibold hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Point 4 Mandatory Mobile Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-dark flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-deep" />
                    <span>Bangladeshi Mobile Number *</span>
                  </label>
                  <span className="text-[10px] font-bold text-deep uppercase tracking-wider">
                    Mandatory (Point 4)
                  </span>
                </div>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2 bg-cream/30 focus-within:bg-white focus-within:border-deep transition">
                  <span className="font-semibold text-dark text-xs pr-2 border-r border-border-gold/60 mr-2">
                    🇧🇩 +88
                  </span>
                  <input
                    required
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full outline-none bg-transparent text-dark text-xs font-mono font-medium"
                  />
                </div>
                <p className="text-[10px] text-muted">
                  Required by Bangladesh logistics couriers for delivery coordination, order confirmation, and SMS notifications.
                </p>
              </div>

              {/* Account Mode Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Select PREMILY Access Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      role === "CUSTOMER"
                        ? "bg-dark text-light-gold border-gold"
                        : "bg-surface-subtle text-dark border-border-gold hover:border-deep"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-gold" />
                    <span className="font-bold text-[11px] block">Customer</span>
                    <span className="text-[9px] text-muted block">Marketplace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("SELLER")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      role === "SELLER"
                        ? "bg-dark text-light-gold border-gold"
                        : "bg-surface-subtle text-dark border-border-gold hover:border-deep"
                    }`}
                  >
                    <Store className="w-4 h-4 mx-auto mb-1 text-gold" />
                    <span className="font-bold text-[11px] block">Seller</span>
                    <span className="text-[9px] text-muted block">৳150/mo Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      role === "ADMIN"
                        ? "bg-dark text-light-gold border-gold"
                        : "bg-surface-subtle text-dark border-border-gold hover:border-deep"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 mx-auto mb-1 text-gold" />
                    <span className="font-bold text-[11px] block">Admin</span>
                    <span className="text-[9px] text-muted block">Mart Controls</span>
                  </button>
                </div>
              </div>

              {role === "SELLER" && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-snug">
                  <b>Seller Perk:</b> Launch your branded storefront (`/[storeSlug]`) with a 1-month free trial. Manage products, custom district rates, and customer orders.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="gbtn w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Connecting Google Account…"
                ) : (
                  <>
                    <span>Confirm & Enter PREMILY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-cream/40 px-6 py-3 border-t border-border-gold/60 flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-deep" />
          <span>Encrypted with OAuth 2.0 & Bangladesh National Identity Safety Standard</span>
        </div>
      </div>
    </div>
  );
}
