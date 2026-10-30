"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, X, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

interface MfsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: "BKASH" | "NAGAD";
  amount: number;
  customerPhone: string;
  storeName: string;
  onSuccess: (trxId: string) => void;
}

export function MfsPaymentModal({
  isOpen,
  onClose,
  gateway,
  amount,
  customerPhone,
  storeName,
  onSuccess,
}: MfsPaymentModalProps) {
  const [step, setStep] = useState<"WALLET" | "OTP" | "PIN" | "SUCCESS">("WALLET");
  const [walletNumber, setWalletNumber] = useState(customerPhone || "01712345678");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(60);

  const resetForm = () => {
    setStep("WALLET");
    setWalletNumber(customerPhone || "01712345678");
    setOtp("");
    setPin("");
    setError(null);
    setIsProcessing(false);
    setTimer(60);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const isBkash = gateway === "BKASH";
  const brandName = isBkash ? "bKash" : "Nagad";
  const brandColor = isBkash ? "bg-[#E2136E]" : "bg-[#F7941E]";
  const brandText = isBkash ? "text-[#E2136E]" : "text-[#F7941E]";

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^01[3-9]\d{8}$/.test(walletNumber.trim())) {
      setError(`Please enter a valid 11-digit Bangladeshi mobile number.`);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("OTP");
      setTimer(60);
    }, 600);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.trim().length < 4) {
      setError("Please enter the verification code.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("PIN");
    }, 600);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.trim().length < 4) {
      setError(`Please enter your ${isBkash ? "5-digit" : "4-digit"} PIN.`);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const generatedTrxId = `${isBkash ? "BK" : "NG"}${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      setStep("SUCCESS");
      setTimeout(() => {
        resetForm();
        onSuccess(generatedTrxId);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Gateway Header */}
        <div className={`${brandColor} px-6 py-5 text-white flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">{brandName}</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                Direct Merchant API
              </span>
            </div>
            <p className="text-xs text-white/90 mt-0.5">Pay to: {storeName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Ribbon */}
        <div className="bg-cream/50 px-6 py-3 border-b border-border-gold/40 flex items-center justify-between text-xs">
          <span className="text-muted">Payable Amount:</span>
          <span className="font-serif font-bold text-base text-dark">
            ৳{amount.toLocaleString("en-BD")}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "WALLET" && (
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">
                  Enter Your {brandName} Account Number:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                    +88
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="017XXXXXXXX"
                    className="w-full rounded-xl border border-border-gold pl-12 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-deep"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1.5">
                  By clicking Proceed, you agree to PREMILY&apos;s terms and {brandName} automated payment agreement.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-muted hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 py-2.5 rounded-xl ${brandColor} text-white font-semibold text-xs shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-muted">A 6-digit verification code was sent to</p>
                <p className="font-semibold text-dark text-sm tracking-wide">{walletNumber}</p>
                <div className="inline-block bg-amber-50 text-amber-800 text-[10px] px-2.5 py-1 rounded-full font-medium border border-amber-200">
                  Demo Sandbox OTP: <strong>123456</strong>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="1 2 3 4 5 6"
                  className="w-full text-center text-xl font-bold tracking-widest rounded-xl border border-border-gold py-2.5 focus:outline-none focus:border-deep"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <span>Didn&apos;t get code?</span>
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTimer(60)}
                    className={`${brandText} font-semibold hover:underline`}
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("WALLET")}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-muted hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 py-2.5 rounded-xl ${brandColor} text-white font-semibold text-xs shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "PIN" && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-muted">Enter your {brandName} Account PIN</p>
                <p className="text-[11px] text-muted/80">
                  (Sandbox simulation: Enter any 4-5 digits, e.g. 12345)
                </p>
              </div>

              <div>
                <input
                  type="password"
                  maxLength={5}
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • •"
                  className="w-full text-center text-2xl font-bold tracking-widest rounded-xl border border-border-gold py-2.5 focus:outline-none focus:border-deep"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-Bit SSL Encrypted & PCI-DSS Compliant Gateway</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("OTP")}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-muted hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 py-2.5 rounded-xl ${brandColor} text-white font-semibold text-xs shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirm Payment</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-semibold text-dark text-base">Payment Verified!</h4>
                <p className="text-xs text-muted mt-0.5">
                  Your transaction has been approved by {brandName}.
                </p>
              </div>
              <p className="text-[11px] text-muted">Finalizing your order placement...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
