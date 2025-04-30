"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";

export default function TermsOfServicePage() {
  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-37 pb-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto space-y-14">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center">
            Terms of Service
          </h1>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-white/80 leading-relaxed">
              By accessing and using VirtuPath AI, you agree to be bound by these Terms of Service, all applicable laws, and regulations. 
              If you do not agree, please refrain from using our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Use of the Platform</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to use VirtuPath AI only for lawful purposes and in accordance with these Terms. 
              You may not use the platform in a way that could harm the service, other users, or our AI systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Account & Access</h2>
            <p className="text-white/80 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Subscription & Payments</h2>
            <p className="text-white/80 leading-relaxed">
              Some features require a paid subscription. All payments are processed securely. 
              Refunds are subject to our Refund Policy and may not apply to crypto transactions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
            <p className="text-white/80 leading-relaxed">
              All content, including AI-generated materials, code, design, and branding are the intellectual property of VirtuPath AI and its licensors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Termination</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to suspend or terminate your access if you violate these Terms or engage in any abusive or harmful behavior on the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">7. Changes to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">8. Contact</h2>
            <p className="text-white/80 leading-relaxed">
              For any questions about these Terms, contact us at{" "}
              <a
                href="mailto:support@virtuweb.ai"
                className="text-purple hover:underline"
              >
                support@virtuweb.ai
              </a>.
            </p>
          </section>
        </div>
      </main>

      <CFooter />
    </div>
  );
}
