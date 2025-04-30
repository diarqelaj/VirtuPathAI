"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";

export default function RefundPolicyPage() {
  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-37 pb-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto space-y-14">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center">
            Refund Policy
          </h1>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Eligibility for Refunds</h2>
            <p className="text-white/80 leading-relaxed">
              We offer refunds for unused course plans requested within 7 days of purchase. Refunds are not available for any plans where daily tasks have been accessed or completed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Crypto Payments</h2>
            <p className="text-white/80 leading-relaxed">
              Due to the irreversible nature of blockchain transactions, payments made via cryptocurrency (e.g. USDT) are **non-refundable**.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. How to Request a Refund</h2>
            <p className="text-white/80 leading-relaxed">
              If eligible, contact us at{" "}
              <a href="mailto:support@virtuweb.ai" className="text-purple hover:underline">
                support@virtuweb.ai
              </a>{" "}
              with your purchase details. Refunds are processed within 5–10 business days to your original payment method.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Policy Changes</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to update or modify this policy at any time. Please review this page for the latest information.
            </p>
          </section>
        </div>
      </main>

      <CFooter />
    </div>
  );
}
