"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { navItems } from "@/data";
import { Spotlight } from "@/components/ui/Spotlight";

const faqs = [
    {
      question: "What is VirtuPath AI?",
      answer:
        "VirtuPath AI is a personalized AI-powered learning platform that adapts to your goals and helps you master skills efficiently with interactive guidance.",
    },
    {
      question: "How does the AI personalization work?",
      answer:
        "Our AI tracks your learning behavior and progress, adjusting content difficulty and suggestions in real-time to ensure you're always moving forward.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We support major credit/debit cards, PayPal, and cryptocurrency payments including USDT (BEP20 and TRC20 networks).",
    },
    {
      question: "Is my crypto payment secure?",
      answer:
        "Yes. Crypto transactions are processed through verified, secure gateways, and blockchain confirmations ensure integrity and safety.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "Refunds are available for non-consumed course packages within 7 days of purchase. Crypto payments are non-refundable due to blockchain finality.",
    },
    {
      question: "Do I need any prior knowledge to get started?",
      answer:
        "Nope! VirtuPath AI offers beginner-friendly paths and personalized tutorials whether you're starting from scratch or leveling up.",
    },
  ];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-32 pb-16 px-6 md:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold mb-16 border-b border-white/10 pb-4">
            FAQ
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-t border-white/10 pt-6 cursor-pointer"
                onClick={() => setOpen(open === index ? null : index)}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg md:text-xl font-medium">{faq.question}</h2>
                  <span className="text-2xl text-white">
                    {open === index ? "−" : "+"}
                  </span>
                </div>
                {open === index && (
                  <p className="text-sm text-white/80 mt-4">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-20 text-center text-xs text-white/40 max-w-3xl mx-auto leading-relaxed">
            All educational payments are processed securely. Crypto transactions require blockchain confirmation. Refund eligibility depends on usage and course completion. VirtuPath AI is committed to your success and privacy.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
