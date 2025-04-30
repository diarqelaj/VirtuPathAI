"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";
import { FaCheck } from "react-icons/fa6";

interface CareerPath {
  careerPathID: number;
  name: string;
  description: string;
  price: number;
}

export default function PricingPage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);

  useEffect(() => {
    api.get("/careerpaths")
      .then((res) => {
        setCareerPaths(res.data);
        setSelectedCareer(res.data[0]);
      })
      .catch((err) => console.error("Failed to fetch careers", err));
  }, []);

  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col overflow-hidden">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      {/* Dotted BG Layer */}
      <div className="absolute inset-0 z-0 opacity-[0.05] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]" />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-center mb-12">
            Career Path Pricing
          </h1>

          {/* Career Path Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {careerPaths.map((career) => (
              <button
                key={career.careerPathID}
                onClick={() => setSelectedCareer(career)}
                className={`
                  px-6 py-2 rounded-full font-medium transition duration-200
                  ${selectedCareer?.careerPathID === career.careerPathID
                    ? "bg-purple text-white shadow-md ring-2 ring-purple/40"
                    : "bg-black-800 text-white/70 hover:bg-purple/20"}
                `}
              >
                {career.name}
              </button>
            ))}
          </div>

          {/* Pricing Cards */}
          {selectedCareer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Monthly Plan */}
              <div className="min-h-[480px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-md transition-all hover:border-purple/40 hover:shadow-purple/40">
                <h3 className="text-lg font-semibold text-white mb-3">Monthly Plan</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  ${Math.ceil(selectedCareer.price / 12)}
                  <span className="text-base text-white/60"> /month</span>
                </p>
                <p className="text-white/70 text-sm mb-6">{selectedCareer.description}</p>
                <ul className="text-white/80 text-sm space-y-2 mb-6">
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Daily AI Tasks</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Motivational Quotes</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Progress Tracking</li>
                </ul>
                <button className="w-full py-2 rounded-lg bg-white/10 text-white hover:bg-purple transition">
                  Subscribe Monthly
                </button>
              </div>

              {/* One-Time Plan (highlighted) */}
              <div className="min-h-[480px] bg-gradient-to-br from-[#9333ea] to-[#a855f7] border border-purple-300 text-white rounded-2xl p-8 shadow-2xl scale-[1.05] hover:shadow-purple-lg transition-all duration-300">
                <h3 className="text-lg font-semibold mb-3">One-Time Plan</h3>
                <p className="text-4xl font-bold mb-2">${selectedCareer.price}</p>
                <p className="text-white/90 text-sm mb-6">{selectedCareer.description}</p>
                <ul className="text-white text-sm space-y-2 mb-6">
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> 365-Day AI Plan</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Lifetime Access</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Performance Reviews</li>
                </ul>
                <button className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition">
                  Get Lifetime Access
                </button>
              </div>

              {/* Bonus Plan */}
              <div className="min-h-[480px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-md transition-all hover:border-yellow-300 hover:shadow-yellow-400">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Pro+ Bonus</h3>
                <p className="text-4xl font-bold text-white mb-2">${Math.ceil(selectedCareer.price * 1.5)}</p>
                <p className="text-white/70 text-sm mb-6">Includes everything + extras</p>
                <ul className="text-white/80 text-sm space-y-2 mb-6">
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> 1-on-1 AI Mentor</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Analytics + Reports</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-green-400" /> Career Certification</li>
                </ul>
                <button className="w-full py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition">
                  Upgrade to Bonus
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <CFooter />
    </div>
  );
}
