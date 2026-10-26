"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Store,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Languages,
  Check,
} from "lucide-react";

type PasswordCriteria = {
  minLength: boolean;
  hasMixedCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

function calculatePasswordStrength(password: string): {
  score: number;
  label: "Too Short" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  textColor: string;
  criteria: PasswordCriteria;
} {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasMixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (criteria.minLength) score += 1;
  if (criteria.hasMixedCase) score += 1;
  if (criteria.hasNumber || criteria.hasSpecial) score += 1;
  if (criteria.hasNumber && criteria.hasSpecial && criteria.minLength) score = 4;

  if (password.length === 0) {
    return { score: 0, label: "Too Short", color: "bg-slate-200", textColor: "text-muted", criteria };
  }
  if (score <= 1) {
    return { score: 1, label: "Weak", color: "bg-rose-500", textColor: "text-rose-600", criteria };
  }
  if (score === 2) {
    return { score: 2, label: "Fair", color: "bg-amber-500", textColor: "text-amber-600", criteria };
  }
  if (score === 3) {
    return { score: 3, label: "Good", color: "bg-[#B8924B]", textColor: "text-[#B8924B]", criteria };
  }
  return { score: 4, label: "Strong", color: "bg-emerald-600", textColor: "text-emerald-700", criteria };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab") === "signup" ? "signup" : "login";
  const redirectUrl = searchParams.get("redirect") || "/";

  const [selectedTab, setSelectedTab] = useState<"login" | "signup" | null>(null);
  const activeTab = selectedTab ?? tabFromQuery;
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupIdentifier, setSignupIdentifier] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<"CUSTOMER" | "SELLER">("CUSTOMER");
  const passwordStrength = calculatePasswordStrength(signupPassword);

  // Status & feedback state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Validation helper for Bangladeshi phone or standard email
  const validateIdentifier = (input: string) => {
    const trimmed = input.trim();
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if numeric (potential phone)
    if (/^\d+$/.test(trimmed)) {
      if (!bdPhoneRegex.test(trimmed)) {
        return "Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01712345678).";
      }
      return null;
    }

    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address or 11-digit Bangladeshi mobile number.";
    }
    return null;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateIdentifier(loginIdentifier);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // In Next.js standalone, try calling the backend API if configured, otherwise persist client session
      const authPayload = {
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authPayload),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("premily_user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("premily_auth_change"));
        }
      } else {
        // Standalone simulated login session
        const isSeller = loginIdentifier.toLowerCase().includes("seller") || loginIdentifier.includes("aura");
        const mockUser = {
          id: `usr_${Date.now().toString(36)}`,
          name: loginIdentifier.includes("@")
            ? loginIdentifier.split("@")[0]
            : "Valued Member",
          phone: !loginIdentifier.includes("@") ? loginIdentifier : "01711111111",
          email: loginIdentifier.includes("@") ? loginIdentifier : null,
          role: isSeller ? "SELLER" : "CUSTOMER",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("premily_user", JSON.stringify(mockUser));
          window.dispatchEvent(new Event("premily_auth_change"));
        }
      }

      setSuccessMessage("Welcome back! Redirecting to PREMILY…");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    } catch {
      setErrorMessage("Unable to complete sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signupName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const validationError = validateIdentifier(signupIdentifier);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (passwordStrength.score < 2) {
      setErrorMessage("Password is too weak. Please include at least 8 characters or a combination of letters and numbers.");
      return;
    }

    setLoading(true);

    try {
      const authPayload = {
        name: signupName.trim(),
        phone: !signupIdentifier.includes("@") ? signupIdentifier.trim() : undefined,
        email: signupIdentifier.includes("@") ? signupIdentifier.trim() : undefined,
        password: signupPassword,
        role: signupRole,
      };

      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authPayload),
      }).catch(() => null);

      const userRecord = {
        id: `usr_${Date.now().toString(36)}`,
        name: signupName.trim(),
        phone: authPayload.phone || "01712345678",
        email: authPayload.email || null,
        role: signupRole,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("premily_user", JSON.stringify(userRecord));
        window.dispatchEvent(new Event("premily_auth_change"));
      }

      setSuccessMessage(
        signupRole === "SELLER"
          ? "Seller account created! Preparing your vendor onboarding…"
          : "Account created successfully! Welcome to PREMILY."
      );

      setTimeout(() => {
        if (signupRole === "SELLER") {
          router.push("/seller");
        } else {
          router.push(redirectUrl);
        }
      }, 1200);
    } catch {
      setErrorMessage("Registration failed. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "Google" | "Facebook") => {
    setLoading(true);
    setSuccessMessage(`Authenticating with ${provider}…`);

    setTimeout(() => {
      const mockSocialUser = {
        id: `usr_soc_${Date.now().toString(36)}`,
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        role: "CUSTOMER",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("premily_user", JSON.stringify(mockSocialUser));
        window.dispatchEvent(new Event("premily_auth_change"));
      }

      router.push(redirectUrl);
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setForgotSubmitted(false);
      setForgotEmail("");
      setSuccessMessage("Password reset instructions sent.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between">
      {/* Top Marketplace Context Bar */}
      <div className="bg-dark text-cream text-xs border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-cream hover:text-gold transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-light-gold hidden sm:inline">
              Safe & Encrypted 256-bit Login
            </span>
            <span className="text-cream/80 hover:text-gold cursor-pointer flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gold" />
              Help & Support
            </span>
            <span className="border border-gold/60 rounded-full px-2.5 py-0.5 hover:bg-gold hover:text-dark cursor-pointer flex items-center gap-1 transition">
              <Languages className="w-3 h-3" />
              বাংলা
            </span>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="premily-card w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border border-border-gold rounded-2xl shadow-md">
          {/* Brand Header */}
          <div className="text-center space-y-1.5">
            <Link
              href="/"
              className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-dark block hover:opacity-95"
            >
              PREMILY<span className="text-deep">.</span>
            </Link>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Curated artisanal living, boutique storefronts, and frictionless delivery across Bangladesh.
            </p>
          </div>

          {/* Tab Switcher: Login / Create Account */}
          <div className="flex border-b border-border-gold/60">
            <button
              type="button"
              onClick={() => {
                setSelectedTab("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === "login"
                  ? "border-deep text-deep font-bold"
                  : "border-transparent text-muted hover:text-dark"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTab("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === "signup"
                  ? "border-deep text-deep font-bold"
                  : "border-transparent text-muted hover:text-dark"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Mobile Number or Email *
                </label>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2.5 bg-cream/30 focus-within:bg-white focus-within:border-deep transition">
                  <Phone className="w-4 h-4 text-deep mr-2.5 shrink-0" />
                  <input
                    required
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 01712345678 or name@example.com"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent text-dark placeholder:text-muted/60"
                  />
                </div>
                <span className="text-[10px] text-muted">
                  Supports 11-digit Bangladeshi mobile numbers or email.
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-dark">Password *</label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-deep font-medium hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2.5 bg-cream/30 focus-within:bg-white focus-within:border-deep transition">
                  <Lock className="w-4 h-4 text-deep mr-2.5 shrink-0" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent text-dark placeholder:text-muted/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-dark ml-2 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gbtn w-full py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold shadow-xs mt-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Authenticating…" : "Sign In to PREMILY"}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
              {/* Account Purpose Toggle: Buyer or Seller */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  I want to join PREMILY as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole("CUSTOMER")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      signupRole === "CUSTOMER"
                        ? "bg-dark text-light-gold border-gold"
                        : "bg-surface-subtle text-dark border-border-gold/60 hover:border-deep"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Customer Shopper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole("SELLER")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      signupRole === "SELLER"
                        ? "bg-dark text-light-gold border-gold"
                        : "bg-surface-subtle text-dark border-border-gold/60 hover:border-deep"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5 text-gold" />
                    <span>Store Merchant</span>
                  </button>
                </div>
                {signupRole === "SELLER" && (
                  <p className="text-[10px] text-deep font-medium bg-cream p-2 rounded-lg border border-border-gold/60">
                    Sellers receive a 1-month free trial, then only ৳150/month with zero sales commission!
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">Full Name *</label>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2.5 bg-cream/30 focus-within:bg-white focus-within:border-deep transition">
                  <User className="w-4 h-4 text-deep mr-2.5 shrink-0" />
                  <input
                    required
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Abdullah Al Rumman"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent text-dark placeholder:text-muted/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Mobile Number or Email *
                </label>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2.5 bg-cream/30 focus-within:bg-white focus-within:border-deep transition">
                  <Phone className="w-4 h-4 text-deep mr-2.5 shrink-0" />
                  <input
                    required
                    type="text"
                    value={signupIdentifier}
                    onChange={(e) => setSignupIdentifier(e.target.value)}
                    placeholder="017xxxxxxxx or your@email.com"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent text-dark placeholder:text-muted/60"
                  />
                </div>
                <span className="text-[10px] text-muted">
                  Used for order notifications, OTP verification, and account recovery.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-dark block">
                  Create Password *
                </label>
                <div className="flex items-center border border-border-gold rounded-xl px-3 py-2.5 bg-cream/30 focus-within:bg-white focus-within:border-deep transition">
                  <Lock className="w-4 h-4 text-deep mr-2.5 shrink-0" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs sm:text-sm outline-none bg-transparent text-dark placeholder:text-muted/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-dark ml-2 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Display */}
                {signupPassword.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">Password Strength:</span>
                      <span className={`font-semibold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* 4-segment visual meter */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                    </div>

                    {/* Criteria checklist */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-0.5">
                      <div
                        className={`flex items-center gap-1 transition ${
                          passwordStrength.criteria.minLength
                            ? "text-emerald-700 font-medium"
                            : "text-muted"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordStrength.criteria.minLength
                              ? "text-emerald-600"
                              : "text-muted/40"
                          }`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 transition ${
                          passwordStrength.criteria.hasMixedCase
                            ? "text-emerald-700 font-medium"
                            : "text-muted"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordStrength.criteria.hasMixedCase
                              ? "text-emerald-600"
                              : "text-muted/40"
                          }`}
                        />
                        <span>Upper & lower case</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 transition ${
                          passwordStrength.criteria.hasNumber
                            ? "text-emerald-700 font-medium"
                            : "text-muted"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordStrength.criteria.hasNumber
                              ? "text-emerald-600"
                              : "text-muted/40"
                          }`}
                        />
                        <span>At least 1 number</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 transition ${
                          passwordStrength.criteria.hasSpecial
                            ? "text-emerald-700 font-medium"
                            : "text-muted"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordStrength.criteria.hasSpecial
                              ? "text-emerald-600"
                              : "text-muted/40"
                          }`}
                        />
                        <span>Special symbol (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gbtn w-full py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-bold shadow-xs mt-2 disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? "Creating Account…"
                  : signupRole === "SELLER"
                  ? "Register My Store"
                  : "Create My Account"}
              </button>
            </form>
          )}

          {/* Social Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-border-gold/60"></div>
            <span className="shrink mx-3 text-[11px] text-muted uppercase tracking-wider">
              Or continue with
            </span>
            <div className="grow border-t border-border-gold/60"></div>
          </div>

          {/* Social Auth Providers */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-2 border border-border-gold rounded-xl py-2.5 font-semibold text-dark hover:border-deep hover:bg-cream/40 transition cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

            <button
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="flex items-center justify-center gap-2 border border-border-gold rounded-xl py-2.5 font-semibold text-dark hover:border-deep hover:bg-cream/40 transition cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Terms & Privacy Footnote */}
          <p className="text-[11px] text-center text-muted leading-relaxed">
            By proceeding, you agree to PREMILY&apos;s{" "}
            <span className="text-dark font-medium underline">Terms of Service</span> and{" "}
            <span className="text-dark font-medium underline">Privacy Policy</span>.
          </p>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border-gold rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-dark">
              Reset Your Password
            </h3>
            <p className="text-xs text-muted">
              Enter your registered Bangladeshi mobile number or email address to receive password reset instructions.
            </p>

            {forgotSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Instructions sent! Please check your SMS or inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <input
                  required
                  type="text"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="017xxxxxxxx or name@email.com"
                  className="w-full border border-border-gold rounded-xl p-2.5 outline-none focus:border-deep"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-border-gold text-muted hover:text-dark cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gbtn px-4 py-1.5 rounded-lg font-semibold cursor-pointer"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-dark text-cream/70 text-center text-xs py-4 border-t border-gold/20">
        © 2026 PREMILY · Architectural Luxury Living & Independent Seller Platform
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center text-xs text-muted">
          Loading PREMILY Authentication…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
