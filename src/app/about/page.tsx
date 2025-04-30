"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";

export default function AboutPage() {
  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto space-y-14">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center">
            About Us
          </h1>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Our Mission</h2>
            <p className="text-white/80 leading-relaxed">
              At <strong>VirtuPath AI</strong>, our mission is to empower individuals worldwide to build successful careers through personalized, AI-driven learning. 
              Whether you're starting fresh or reskilling, we offer structured daily paths, intelligent progress tracking, and motivational tools that keep you on track — every single day.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">What We Do</h2>
            <p className="text-white/80 leading-relaxed">
              VirtuPath AI delivers curated daily learning paths tailored to your chosen career — from software development to business, content creation to data science. 
              Our AI tracks your progress, evaluates your consistency, and dynamically adjusts your experience to keep you moving forward.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Our Team</h2>
            <p className="text-white/80 leading-relaxed">
              We’re a small, passionate team of engineers, designers, and dreamers building the future of self-driven education. 
              We believe that consistency beats intensity, and that the right tools can change lives.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Why VirtuPath AI?</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>AI-Generated Daily Tasks — unique to your path</li>
              <li>Motivational quotes and tracking to stay focused</li>
              <li>365-day structured growth plans</li>
              <li>Performance reviews based on your discipline</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Get in Touch</h2>
            <p className="text-white/80">
              Have questions or ideas? Reach out to us at{" "}
              <a
                href="mailto:support@virtuweb.ai"
                className="text-purple hover:underline"
              >
                support@virtuweb.ai
              </a>
              . We’d love to hear from you.
            </p>
          </section>
        </div>
      </main>

      <CFooter />
    </div>
  );
}
