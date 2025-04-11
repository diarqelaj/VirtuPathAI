"use client";

import { Spotlight } from "@/components/ui/Spotlight";
import { navItems } from "@/data";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import "../globals.css";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Career {
  careerPathID: number;
  name: string;
  description: string;
  price: number;
}

interface User {
  email: string;
  role: string;
  userID: number;
}

const Page = () => {
  const [careerPaths, setCareerPaths] = useState<Career[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Career | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const auth = useAuth();
  const user = auth.user as User | null; // ✅ Typecast for TS to recognize userID
  const isLoggedIn = auth.isLoggedIn;

  const router = useRouter();

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get<Career[]>("CareerPaths");
        setCareerPaths(res.data);
      } catch (err) {
        console.error("Failed to fetch careers:", err);
      }
    };

    fetchCareers();
  }, []);

  const handleEnrollment = () => {
    if (!selectedProgram) return;

    const pendingData = {
      ...selectedProgram,
      userID: user?.userID || null, // ✅ TS now knows userID exists
    };

    localStorage.setItem("pendingEnrollment", JSON.stringify(pendingData));

    if (!isLoggedIn()) {
      router.push("/login");
    } else {
      router.push("/payment");
    }
  };

  const EnrollmentTab = () => {
    if (!selectedProgram) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative bg-[#0c0c16] rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30 animate-in fade-in-zoom">
          <button
            onClick={() => setShowEnrollment(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Enroll in {selectedProgram.name}
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800/50">
                <h3 className="text-lg font-semibold mb-3">Course Details</h3>
                <p className="text-sm text-gray-400">{selectedProgram.description}</p>
              </div>

              <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800/50 space-y-4">
                <h3 className="text-lg font-semibold mb-3">Payment</h3>
                <p className="text-purple-400 text-2xl font-bold">€{selectedProgram.price}</p>
                <button
                  onClick={handleEnrollment}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <BookOpenIcon className="h-5 w-5" />
                  Complete Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      {showEnrollment && <EnrollmentTab />}
      <div className="pt-20 px-4 md:px-6 flex-grow">
        <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white" />
        <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="purple" />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />

        <div className="relative z-10 text-center max-w-6xl mx-auto mt-27 px-4 md:px-6 flex-grow">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Explore Career Training
          </h1>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg">
            Launch or level up your tech career with our industry-ready training.
            <span className="block mt-2 text-purple-300">Affordable. Flexible. 100% online.</span>
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {careerPaths.map((program) => (
              <div
                key={program.careerPathID}
                className="relative group p-[2px] bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-2xl card-hover-glow transition-all duration-300 min-h-[300px] flex flex-col"
              >
                <div className="relative h-full bg-[#0c0c16] rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm flex flex-col">
                  <h3 className="text-xl font-semibold">{program.name}</h3>
                  <p className="text-gray-300 text-sm mt-2 line-clamp-4">
                    {program.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="text-purple-400 text-lg font-bold">€{program.price}</span>
                    <button
                      onClick={() => {
                        setSelectedProgram(program);
                        setShowEnrollment(true);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
