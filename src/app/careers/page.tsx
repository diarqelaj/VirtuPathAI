"use client";

import { Spotlight } from "@/components/ui/Spotlight";
import { navItems, careers as staticCareers } from "@/data";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import {
  BookOpenIcon,
  UserIcon,
  StarIcon,
  GlobeAltIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import "../globals.css";

interface BackendCareer {
  careerPathID: number;
  name: string;
  description: string;
  price: number;
}

interface FrontendExtras {
  id: number;
  title: string;
  description: string;
  location: string;
  img: string;
  originalPrice: string;
  enrolled: number;
  rating: string;
  skills: string[];
}

type CombinedCareer = BackendCareer & Omit<FrontendExtras, "title" | "id" | "description">;

const Page = () => {
  const [careerPaths, setCareerPaths] = useState<CombinedCareer[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get<BackendCareer[]>("CareerPaths");
        const enriched = res.data.map((career) => {
          const extras = staticCareers.find((c) => c.id === career.careerPathID);
          return {
            ...career,
            img: extras?.img || "/careers/default.jpg",
            originalPrice: extras?.originalPrice || "€0",
            enrolled: extras?.enrolled || 0,
            rating: extras?.rating || "0.0",
            skills: extras?.skills || [],
            location: extras?.location || "Remote",
          };
        });

        setCareerPaths(enriched);
      } catch (err) {
        console.error("Failed to fetch careers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const CareerCard = ({ career }: { career: CombinedCareer }) => {
    const discount = Math.round(
      (1 - career.price / parseFloat(career.originalPrice.replace("€", ""))) * 100
    );

    return (
      <div className="bg-[#10101a] border border-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 group flex flex-col min-h-[520px] w-full max-w-[360px] flex-shrink-0">
        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
          <Image
            src={career.img}
            alt={career.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          {career.enrolled > 2000 && (
            <span className="absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs font-semibold text-white bg-purple-500/10 backdrop-blur-md border border-purple-300/20 shadow-md shadow-purple-500/40">
              POPULAR
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 text-left flex-grow">
          <h3 className="text-lg font-semibold">{career.name}</h3>

          <div className="text-xs text-gray-400 flex items-center gap-5 mt-1">
            <span className="flex items-center gap-1">
              <GlobeAltIcon className="w-4 h-4" />
              <span className="text-gray-300">Virtual</span>
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {Math.floor(career.enrolled / 30)} enrolled this month
            </span>
          </div>

          <p className="text-sm text-gray-300 mt-1">{career.description}</p>

          <div className="flex flex-wrap gap-2 my-2 max-h-[72px] overflow-y-auto scrollbar-thin">
            {career.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-[#1a1a2f] text-gray-200 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-gray-800 text-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-gray-300">
                <UserIcon className="w-4 h-4" />
                <span>{career.enrolled.toLocaleString()}+ enrolled</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <StarIcon className="w-4 h-4" />
                <span>{career.rating}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-white">€{career.price}</p>
                <div className="flex gap-2 mt-1 items-center">
                  <span className="text-sm text-green-400 bg-green-600/20 px-2 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                  <span className="text-sm line-through text-gray-400">
                    {career.originalPrice}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/payment?careerId=${career.careerPathID}`)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm font-medium rounded-lg text-white flex items-center gap-2"
              >
                <BookOpenIcon className="w-4 h-4" />
                Enroll
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-[#10101a] border border-gray-800 rounded-2xl shadow-sm p-4 animate-pulse flex flex-col min-h-[520px] w-full max-w-[360px] flex-shrink-0">
      <div className="w-full h-40 bg-gray-800 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="w-16 h-5 bg-gray-800 rounded-full"></div>
        <div className="w-20 h-5 bg-gray-800 rounded-full"></div>
        <div className="w-12 h-5 bg-gray-800 rounded-full"></div>
      </div>
      <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6 mb-2"></div>
      <div className="mt-auto pt-3 border-t border-gray-800 text-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="w-20 h-4 bg-gray-700 rounded"></div>
          <div className="w-10 h-4 bg-gray-700 rounded"></div>
        </div>
        <div className="w-full h-8 bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />

      <div className="pt-20 px-4 md:px-6 flex-grow">
        <div className="top-25 relative z-10 text-center max-w-6xl mx-auto px-4 md:px-6 flex-grow">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Explore Career Training
          </h1>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg">
            Launch or level up your career with immersive, guided training.
          </p>

          {/* Desktop Grid */}
          <div className="hidden md:grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
              : careerPaths.map((career) => <CareerCard key={career.careerPathID} career={career} />)}
          </div>

          {/* Mobile Carousel */}
          <div className="flex md:hidden gap-4 overflow-x-auto no-scrollbar pb-8">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => <SkeletonCard key={idx} />)
              : careerPaths.map((career) => <CareerCard key={career.careerPathID} career={career} />)}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;
