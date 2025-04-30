"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import Footer from "@/components/Footer";
import { navItems } from "@/data";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface CareerPath {
  careerPathID: number;
  name: string;
  description: string;
  price: number;
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 min-h-[500px] animate-pulse">
    <div className="h-6 w-1/2 bg-white/20 mb-2 rounded" />
    <div className="h-4 w-3/4 bg-white/10 mb-3 rounded" />
    <div className="border-t border-dashed border-white/10 mb-4" />
    <div className="h-10 w-1/3 bg-white/20 mb-4 rounded" />
    <div className="h-10 w-full bg-white/10 mb-5 rounded-lg" />
    <ul className="space-y-3">
      {[...Array(5)].map((_, j) => (
        <li key={j} className="h-4 w-full bg-white/10 rounded" />
      ))}
    </ul>
  </div>
);

const SkeletonSlider = () => (
  <div className="flex justify-center gap-4 mb-14 animate-pulse overflow-hidden">
    <div className="w-9 h-9 bg-white/10 rounded-full" />
    <div className="w-32 h-10 bg-white/10 rounded-full" />
    <div className="w-9 h-9 bg-white/10 rounded-full" />
  </div>
);

export default function PricingPage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "onetime" | "bonus">("onetime");

  useEffect(() => {
    api.get("/careerpaths")
      .then((res) => {
        setCareerPaths(res.data);
        setCurrentIndex(0);
      })
      .catch((err) => console.error("Failed to fetch careers", err));
  }, []);

  const selectedCareer = careerPaths[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % careerPaths.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + careerPaths.length) % careerPaths.length);

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col overflow-hidden">
      <FloatingNav navItems={navItems} />

      {/* MAIN CONTENT */}
      <main className="relative z-10 pt-32 pb-24 px-6 md:px-20 flex-1">

        {/* Dot Background + Spotlight inside main only */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full opacity-[0.05] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:18px_18px]" />
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Choose Your Career Plan
          </h1>

          {careerPaths.length === 0 ? (
            <>
              <SkeletonSlider />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </>
          ) : (
            <>
              {/* Career Path Slider */}
              <div className="relative mb-16 flex items-center justify-center gap-4">
                <button onClick={prev} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
                  <FaChevronLeft />
                </button>
                <div className="text-lg px-8 py-2 rounded-full bg-white/10 shadow-inner text-white font-medium border border-white/10">
                  {selectedCareer?.name}
                </div>
                <button onClick={next} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition">
                  <FaChevronRight />
                </button>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                {["monthly", "onetime", "bonus"].map((plan) => {
                  const isActive = selectedPlan === plan;
                  const price =
                    plan === "monthly"
                      ? Math.ceil(selectedCareer.price / 12)
                      : plan === "bonus"
                      ? Math.ceil(selectedCareer.price * 1.5)
                      : selectedCareer.price;

                  const title =
                    plan === "monthly"
                      ? "Monthly Plan"
                      : plan === "onetime"
                      ? "One-Time Plan"
                      : "Pro Bonus";

                  const paragraph =
                    plan === "monthly"
                      ? "For small to medium sized business that have a smaller target audience"
                      : plan === "onetime"
                      ? "For larger more dynamic businesses that have more than 100k active users"
                      : "For major institutions that have millions of transactions each month";

                  const features =
                    plan === "monthly"
                      ? ["Daily AI Tasks", "Motivational Quotes", "Progress Tracking", "Cancel Anytime", "Email Support"]
                      : plan === "onetime"
                      ? ["365-Day AI Plan", "Lifetime Access", "Performance Reviews", "Progress Analytics", "Mobile App"]
                      : ["1-on-1 AI Mentor", "Analytics + Reports", "Career Certification", "AI Portfolio Review", "Community Forum Access"];

                  return (
                    <div
                      key={plan}
                      onClick={() => setSelectedPlan(plan as any)}
                      className={`relative z-10 rounded-2xl border border-white/10 bg-white/5 p-6 min-h-[500px] transition-all cursor-pointer ${
                        isActive
                          ? "shadow-[0_0_40px_2px_rgba(162,100,255,0.25)] scale-[1.07]"
                          : "hover:shadow-[0_0_40px_2px_rgba(162,100,255,0.25)]"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-1 [text-shadow:0_0_10px_rgba(162,100,255,0.6)]">
                        {plan === "bonus" ? (
                          <>
                            <span className="text-purple">Pro</span>
                            <span className="ml-1 [text-shadow:0_0_10px_rgba(255,255,100,0.4)]"> Bonus</span>
                          </>
                        ) : (
                          title
                        )}
                      </h3>
                      <p className="text-sm text-white/70 mb-3">{paragraph}</p>
                      <div className="border-t border-dashed border-white/20 mb-4" />
                      <p className="text-[2rem] font-bold mb-4 [text-shadow:0_0_12px_rgba(162,100,255,0.6)]">
                        ${price}
                        {plan === "monthly" && <span className="text-base text-white/60"> /month</span>}
                      </p>
                      <button
                        className={`w-full py-3 mb-5 rounded-lg font-semibold transition ${
                          plan === "onetime"
                            ? "bg-[#8a4dff] hover:bg-[#5f4f7e] text-white"
                            : plan === "bonus"
                            ? "bg-yellow-400 hover:bg-yellow-300 text-black"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {plan === "onetime" ? "Get Lifetime Access" : plan === "bonus" ? "Upgrade to Bonus" : "Subscribe Monthly"}
                      </button>
                      <ul className="text-white/80 text-sm space-y-2">
                        {features.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <FaCheck className="text-white-10" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer outside the dot/spotlight area */}
      <Footer />
    </div>
  );
}
