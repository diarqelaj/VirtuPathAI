"use client";

import React from "react";
import Image from "next/image";
import { testimonials, companies } from "@/data";

const Clients = () => {
  const sortedTestimonials = [...testimonials].sort(
    (a, b) => b.quote.length - a.quote.length
  );

  return (
    <section id="testimonials" className="py-20 text-white relative overflow-hidden">
      <h1 className="text-center text-3xl font-bold mb-12">
        Kind words from
        <span className="text-[#a855f7]"> satisfied clients</span>
      </h1>
      
      {/* ✅ Masonry Layout with Forced Overflow */}
      <div className="relative columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 max-w-6xl mx-auto px-6 overflow-hidden">
        {sortedTestimonials.map((testimonial) => {
          const textLength = testimonial.quote.length;
          let sizeClass = "pb-4"; // Default size

          if (textLength > 180) sizeClass = "pb-8"; // Bigger
          else if (textLength > 120) sizeClass = "pb-6"; // Medium

          return (
            <div
              key={testimonial.id}
              className={`bg-[#1a1b2f] text-white p-6 rounded-lg shadow-lg border border-gray-800 break-inside-avoid mb-6 ${sizeClass}`}
            >
              <p className="text-gray-300 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="mt-4 flex items-center gap-3 border-t border-gray-700 pt-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border border-gray-700"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.title}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* ✅ Filler Elements to Make the Bottom Even */}
        <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#00001e] to-transparent pointer-events-none"></div>
      </div>

      {/* ✅ Company Logos */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16 mt-16">
        {companies.map((company) => (
          <div key={company.id} className="flex items-center gap-2">
            {company.img && (
              <Image
                src={company.img}
                alt={company.name}
                width={56}
                height={56}
                className="md:w-14 w-8 h-auto object-contain"
              />
            )}
            <Image
              src={company.nameImg}
              alt={company.name}
              width={112}
              height={40}
              className="md:w-28 w-20 h-auto object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Clients;
