"use client";

import { FaCreditCard, FaCrown, FaFileInvoice } from "react-icons/fa";

export default function BillingSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <h2 className="text-3xl font-bold text-white">Billing & Subscription</h2>

      {/* Current Plan */}
      <div className="p-6 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] hover:bg-white/5 transition">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <FaCrown className="text-yellow-400 w-6 h-6 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
              <p className="text-sm text-white/60">€15/month — Billed monthly</p>
            </div>
          </div>
          <button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-6 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] hover:bg-white/5 transition">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <FaCreditCard className="text-purple-400 w-6 h-6 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Payment Method</h3>
              <p className="text-sm text-white/60">Visa ending in 4242 — Expires 04/26</p>
            </div>
          </div>
          <button className="text-sm bg-white/10 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition">
            Update Card
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="p-6 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] hover:bg-white/5 transition">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <FaFileInvoice className="text-white/70 w-6 h-6 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Billing History</h3>
              <p className="text-sm text-white/60">Access past invoices and receipts.</p>
            </div>
          </div>
          <button className="text-sm bg-white/10 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
