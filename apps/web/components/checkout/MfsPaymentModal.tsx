"use client";
import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
interface MfsPaymentModalProps {
  isOpen: boolean; onClose: () => void; gateway: "BKASH" | "NAGAD"; amount: number;
  customerPhone: string; storeName: string; onSuccess: (trxId: string, senderNumber: string) => void;
}
export function MfsPaymentModal({ isOpen, onClose, gateway, amount, customerPhone, storeName, onSuccess }: MfsPaymentModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState(customerPhone);
  const [error, setError] = useState("");
  if (!isOpen) return null;
  const brand = gateway === "BKASH" ? "bKash" : "Nagad";
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(senderNumber.trim())) { setError("Enter the mobile number used to send the payment."); return; }
    if (!transactionId.trim()) { setError("Enter the transaction ID from your real payment receipt."); return; }
    onSuccess(transactionId.trim(), senderNumber.trim());
    setTransactionId(""); setError("");
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-md rounded-2xl border border-border-gold bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-lg font-bold">{brand} payment proof</h2><button type="button" onClick={onClose} aria-label="Close"><X /></button></div>
      <p className="text-sm text-muted">Pay ৳{amount.toLocaleString("en-BD")} to the merchant using your {brand} app, then submit the receipt details below. PREMILY does not process the wallet payment here.</p>
      <p className="mt-2 text-xs text-muted">Store: {storeName}</p>
      {error && <p role="alert" className="mt-3 flex items-center gap-2 text-xs text-rose-700"><AlertCircle className="size-4" />{error}</p>}
      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block text-xs font-medium">Sender mobile number<input required value={senderNumber} onChange={e=>setSenderNumber(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>
        <label className="block text-xs font-medium">Transaction ID<input required value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-xs">Cancel</button><button type="submit" className="gbtn rounded-lg px-4 py-2 text-xs">Submit payment proof</button></div>
      </form>
    </div>
  </div>;
}