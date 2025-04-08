"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { navItems } from "@/data";
import { Spotlight } from "@/components/ui/Spotlight";

const faqs = [
  {
    question: "Does VirtuPath have tools for complex learners?",
    answer: "Yes, VirtuPath AI supports advanced goal setting, multi-track planning, and real-time personalization even for high-level learners and professionals.",
  },
  {
    question: "How does buy now, pay later work?",
    answer: "We partner with crypto providers and traditional gateways to offer flexible payment terms, allowing learners to start immediately and pay over time.",
  },
  {
    question: "What are merchant services?",
    answer: "For institutions or group plans, we support bulk licensing, API billing integration, and managed service dashboards.",
  },
  {
    question: "How does VirtuPath compare to other platforms?",
    answer: "Our AI engine delivers real-time personalized pathways, unlike static course platforms. We also support both fiat and crypto payments out of the box.",
  },
  {
    question: "Does VirtuPath support professional upskilling?",
    answer: "Absolutely. From coding to business strategy, our platform recommends resources tailored to real-world job roles.",
  },
  {
    question: "What kind of resources does VirtuPath provide?",
    answer: "Video content, interactive challenges, quizzes, AI tutors, and personalized notes all adapt to your progress over time.",
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
