"use client";

import Image from "next/image";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import CFooter from "@/components/CFooter";
import { navItems } from "@/data";
import { services } from "@/data/index";

export default function AboutPage() {
  return (
    <div className="relative bg-black-100 text-white min-h-screen flex flex-col overflow-x-hidden">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-40 pb-20 px-4 sm:px-6 md:px-20 relative z-10">
        {/* About Us Section */}
        <section className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-widest text-white/50 mb-2">About us</h2>
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-6 max-w-2xl">
              Best creative and <br /> modern AI education platform.
            </h3>
            <p className="text-white/70 text-base max-w-2xl mb-6 leading-relaxed">
              At VirtuPath AI, our mission is to deliver structured daily growth with progress tracking,
              motivation, and intelligent adaptability. We believe daily consistency is the key to
              achieving long-term success.
            </p>
            <a href="/terms-of-service" className="text-sm text-purple hover:underline">
              Our Services →
            </a>
          </div>

          {/* Built with AI Section */}
          <div className="md:mt-28">
            <div className="md:w-1/2 w-full md:ml-auto">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4">
                Built with professionalism, refined with discipline.
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed text-base">
                We’ve helped thousands of learners transform their career paths with personalized
                daily missions, weekly performance reviews, and a deep learning flow designed to
                maximize long-term growth.
              </p>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold">10</h4>
                  <p className="text-xs sm:text-sm text-white/60">Years of Experience</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold">3</h4>
                  <p className="text-xs sm:text-sm text-white/60">Awards Won</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold">15K</h4>
                  <p className="text-xs sm:text-sm text-white/60">Users Helped</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mt-32 max-w-7xl mx-auto flex justify-center">
          {/* ✅ Desktop layout */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 pt-20 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`backdrop-blur-md border border-white/10 px-6 py-10 text-center bg-white/20
                  shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] w-[230px] flex flex-col items-center justify-between
                  ${index === 1 ? "h-[380px]" : "h-[340px]"}`}
              >
                <Image
                  src={service.icon}
                  alt={`${service.title} icon`}
                  width={48}
                  height={48}
                  className="mb-4"
                />
                <div className="mb-auto">
                  <p className="text-white text-base font-medium mb-1">0{index + 1}.</p>
                  <h3 className="text-lg font-semibold text-white leading-snug">
                    {service.title}
                  </h3>
                </div>
                <p className="text-white/60 text-xs border-t border-white/10 pt-3 mt-6 w-full text-center">
                  {service.projects} project done
                </p>
              </div>
            ))}
          </div>

          {/* ✅ Mobile layout */}
          <div className="md:hidden flex overflow-x-auto space-x-4 pt-12 px-1 pb-4 no-scrollbar">
            {services.map((service, index) => (
              <div
                key={index}
                className={`backdrop-blur-md border border-white/10 px-6 py-8 text-center bg-white/20
                  shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] w-[230px] flex-shrink-0 flex flex-col items-center justify-between
                  ${index === 1 ? "h-[360px]" : "h-[320px]"}`}
              >
                <Image
                  src={service.icon}
                  alt={`${service.title} icon`}
                  width={44}
                  height={44}
                  className="mb-4"
                />
                <div className="mb-auto">
                  <p className="text-white text-sm font-medium mb-1">0{index + 1}.</p>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {service.title}
                  </h3>
                </div>
                <p className="text-white/60 text-xs border-t border-white/10 pt-3 mt-6 w-full text-center">
                  {service.projects} project done
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CFooter />
    </div>
  );
}
