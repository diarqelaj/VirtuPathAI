"use client";

import { Spotlight } from "@/components/ui/Spotlight";
import { careers, navItems } from "@/data";
import Image from "next/image";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { GlobeAltIcon, ClockIcon, UserIcon, StarIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import '../globals.css';

interface Career {
  id: number;
  title: string;
  description: string;
  location: string;
  img: string;
  price: string;
  originalPrice: string;
  enrolled: number;
  rating: string;
  skills: string[];
}

const Page = () => {
  const [selectedProgram, setSelectedProgram] = useState<Career | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const EnrollmentTab = () => {
    if (!selectedProgram) return null;

    const discount = Math.round(
      (1 - parseFloat(selectedProgram.price.replace('€','')) /
      parseFloat(selectedProgram.originalPrice.replace('€',''))) * 100
    );

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
              Enroll in {selectedProgram.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800/50">
                  <h3 className="text-lg font-semibold mb-3">Course Details</h3>
                  <p className="text-sm text-gray-400">{selectedProgram.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span>Rating: {selectedProgram.rating}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800/50">
                  <h3 className="text-lg font-semibold mb-3">Skills You'll Gain</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.skills.map((skill: string) => (
                      <span 
                        key={skill}
                        className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#12121a] rounded-xl border border-gray-800/50 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                  <div className="space-y-4">
                    <div className="bg-[#0c0c16] rounded-lg p-3 border border-gray-800/50">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-purple-400">
                          {selectedProgram.price}
                        </span>
                        <span className="text-sm text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                          {discount}% OFF
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Original Price: {selectedProgram.originalPrice}
                      </p>
                    </div>

                    <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                      <BookOpenIcon className="h-5 w-5" />
                      Complete Enrollment
                    </button>
                  </div>
                </div>
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
            Launch or level up your tech career with our industry-ready, hands-on training programs.
            <span className="block mt-2 text-purple-300">Affordable. Flexible. 100% online.</span>
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {careers.map((program) => {
              const discount = Math.round(
                (1 - parseFloat(program.price.replace('€','')) / 
                parseFloat(program.originalPrice.replace('€',''))) * 100
              );
              
              return (
                <div 
                  key={program.id}
                  className="relative group p-[2px] bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-2xl card-hover-glow transition-all duration-300 min-h-[550px] flex flex-col"
                >
                  <CourseViewTracker programId={program.id} />
                  
                  <div className="relative h-full bg-[#0c0c16] rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm flex flex-col">
                    {program.enrolled > 2000 && (
                      <span className="absolute top-4 right-4 bg-yellow-400/90 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse z-10">
                        🔥 POPULAR
                      </span>
                    )}

                    <div className="relative w-full h-40 mb-4 overflow-hidden rounded-xl flex-shrink-0 z-0">
                      <Image
                        src={program.img}
                        alt={program.title}
                        fill
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTIxMjEyIi8+PC9zdmc+"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>

                    <div className="flex flex-col gap-3 flex-grow">
                      <div className="flex items-center justify-between text-left"> 
                        <h3 className="text-xl font-semibold">{program.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <GlobeAltIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{program.location}</span>
                        <ClockIcon className="h-4 w-4 ml-auto flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">
                          {Math.floor(program.enrolled / 30)} enrolled this month
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                        {program.description}
                      </p>

                      <div className="flex flex-wrap gap-2 max-h-[72px] overflow-y-auto py-1 scrollbar-thin">
                        {program.skills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-2 py-1 bg-gray-800/50 hover:bg-purple-600/30 rounded-full text-xs cursor-default transition-colors whitespace-nowrap"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>{program.enrolled.toLocaleString()}+ enrolled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarIcon className="h-4 w-4 text-yellow-400" />
                            <span>{program.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col relative pr-10 min-w-[120px]">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-purple-400">
                                {program.price}
                              </span>
                              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full animate-ping-slow absolute -top-3 right-0 whitespace-nowrap">
                                {discount}% OFF
                              </span>
                            </div>
                            <span className="text-sm line-through text-gray-500">
                              {program.originalPrice}
                            </span>
                          </div>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const CourseViewTracker = ({ programId }: { programId: number }) => {
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('viewedCourses') || '[]');
    if (!viewed.includes(programId)) {
      localStorage.setItem('viewedCourses', JSON.stringify([...viewed, programId]));
    }
  }, [programId]);

  return null;
};

export default Page;
