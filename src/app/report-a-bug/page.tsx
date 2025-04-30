"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";
import { useState } from "react";

export default function ReportBugPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful submission
    setSubmitted(true);
  };

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-37 pb-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold border-b border-white/10 pb-6 text-center mb-12">
            Report a Bug
          </h1>

          {submitted ? (
            <div className="text-center text-green-400 text-lg">
              ✅ Thank you! Your bug report has been received.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-white/80">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-2 bg-black-800 text-white rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-white/80">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-2 bg-black-800 text-white rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 text-white/80">
                  Describe the Issue
                </label>
                <textarea
                  id="description"
                  rows={6}
                  required
                  className="w-full px-4 py-2 bg-black-800 text-white rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple"
                ></textarea>
              </div>

              {/* Optional file input for screenshot upload (non-functional placeholder) */}
              {/* <div>
                <label htmlFor="screenshot" className="block mb-2 text-white/80">
                  Screenshot (optional)
                </label>
                <input
                  type="file"
                  id="screenshot"
                  className="text-white/80"
                />
              </div> */}

              <button
                type="submit"
                className="bg-purple hover:bg-purple/90 transition px-6 py-2 rounded-md text-white font-medium"
              >
                Submit Bug Report
              </button>
            </form>
          )}
        </div>
      </main>

      <CFooter />
    </div>
  );
}
