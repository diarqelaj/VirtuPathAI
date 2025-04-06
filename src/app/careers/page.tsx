"use client";

import { Spotlight } from "@/components/ui/Spotlight";
import { careers, navItems } from "@/data";
import Image from "next/image";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import '../globals.css';

const CareersPage = () => {
  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
  <FloatingNav navItems={navItems} />

  <div className="pt-50 px-4 md:px-6 flex-grow"> {/* Increased top padding */}
    <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white" />
    <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="purple" />
    <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
    
    <div className="relative z-10 text-center max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Explore Career Training</h1>
      <p className="text-gray-300 mb-12">
        Launch or level up your tech career with our industry-ready, hands-on training programs. Affordable. Flexible. 100% online.
      </p>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((program) => (
          <div
            key={program.id}
            className="bg-[#0c0c16] p-6 rounded-xl shadow-lg border border-gray-800 hover:scale-[1.03] transition-transform duration-200"
          >
            <div className="relative w-full h-40 mb-4">
              <Image
                src={program.img}
                alt={program.title}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-2">{program.title}</h3>
            <p className="text-sm text-gray-400 mb-1">{program.location}</p>
            <p className="text-gray-300 text-sm mb-4">{program.description}</p>
            <p className="text-deeppurple-100 font-semibold text-lg">
              🎓 Training Cost: {program.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>

  <Footer />
</div>

  );
};

export default CareersPage;
