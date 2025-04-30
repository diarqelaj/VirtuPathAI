"use client";

import { useState } from "react";
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
                <li>Your name, email, phone number, and account details</li>
                <li>Your progress, task completions, and career path choices</li>
                <li>AI interaction history and preferences</li>
                <li>Usage data like browser info, IP address, and pages visited</li>
            </ul>
            </section>

            <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">3. Why We Collect It</h2>
            <p className="text-white/80 leading-relaxed">
                We collect this data to personalize your AI experience, improve platform performance, provide support, and ensure secure transactions. Some anonymous data may be used to enhance our AI models.
            </p>
            </section>

            <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">4. Data Sharing</h2>
            <p className="text-white/80 leading-relaxed">
                We never sell your data. We only share with trusted third-party services like payment processors, analytics tools, and infrastructure providers—strictly for operational purposes.
            </p>
            </section>

            <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-white">5. Your Rights</h2>
            <p className="text-white/80 leading-relaxed">
                You have the right to access, update, or delete your data. To make a request, email us at{" "}
                <a href="mailto:support@virtuweb.ai" className="text-purple hover:underline">virtupathai@gmail.com</a>.
            </p>
            </section>

            <p className="mt-16 text-center text-xs text-white/40 max-w-xl mx-auto leading-relaxed">
            VirtuPath AI is committed to providing you with secure, transparent, and ethical AI solutions.
            This policy is reviewed regularly to reflect evolving standards and best practices.
            </p>
        </div>
      </main>


      <Footer />
    </div>
  );
}
