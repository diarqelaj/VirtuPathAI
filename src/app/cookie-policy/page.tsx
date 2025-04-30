"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";

export default function CookiePolicyPage() {
  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto space-y-14">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center">
            Cookie Policy
          </h1>

          <section className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              This Cookie Policy explains how VirtuPath AI uses cookies and similar technologies to recognize you when you visit our platform. It explains what these technologies are and why we use them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. What Are Cookies?</h2>
            <p className="text-white/80">
              Cookies are small data files placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work or to improve performance and user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Why We Use Cookies</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>To remember your preferences and login sessions</li>
              <li>To analyze usage patterns and improve functionality</li>
              <li>To deliver relevant content and marketing</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. How to Control Cookies</h2>
            <p className="text-white/80">
              Most browsers let you control cookies through their settings. You can also clear cookies or block them entirely, but this may affect your experience on VirtuPath AI.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Updates to This Policy</h2>
            <p className="text-white/80">
              We may update this Cookie Policy from time to time. Any changes will be posted here with an updated revision date.
            </p>
          </section>
        </div>
      </main>

      <CFooter />
    </div>
  );
}
