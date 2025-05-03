"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import Footer from "@/components/Footer";
import { navItems } from "@/data";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-38 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center">
            Privacy Policy
          </h1>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              Welcome to VirtuPath AI. We are committed to protecting your personal data and your right to privacy. This Privacy Policy outlines how we collect, use, and protect your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">2. What We Collect</h2>
            <ul className="list-disc list-inside text-white/80 space-y-1">
              <li>Your name, email, and account information</li>
              <li>Task completions, preferences, and activity history</li>
              <li>AI interaction records</li>
              <li>Browser/device details, IP address, and general usage data</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">3. Why We Collect It</h2>
            <p className="text-white/80 leading-relaxed">
              Your data helps us personalize your AI journey, optimize features, prevent spam, detect abuse, and provide support. IP addresses may be logged to protect our system against abuse (e.g., bug report spam), detect suspicious activity, and improve platform integrity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">4. Data Sharing</h2>
            <p className="text-white/80 leading-relaxed">
              We do not sell your data. Select third-party services (such as payment processors and analytics tools) may receive only what is necessary to operate our services securely and efficiently.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">5. IP Address Usage</h2>
            <p className="text-white/80 leading-relaxed">
              We store IP addresses for essential security operations like rate-limiting submissions and detecting abuse patterns. This helps protect the community from malicious users without compromising your experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">6. Your Rights</h2>
            <p className="text-white/80 leading-relaxed">
              You can request to access, correct, or delete your personal data at any time. Reach us at{" "}
              <a href="mailto:virtupathai@gmail.com" className="text-purple hover:underline">virtupathai@gmail.com</a> for any privacy-related concerns.
            </p>
          </section>

          <p className="mt-16 text-center text-xs text-white/40 max-w-xl mx-auto leading-relaxed">
            VirtuPath AI is committed to providing secure, transparent, and user-focused AI tools.
            We update this policy regularly to stay aligned with legal and ethical best practices.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
