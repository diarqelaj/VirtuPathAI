"use client";

import React from "react";

interface NeonCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export default function NeonCheckbox({ checked, onChange, label }: NeonCheckboxProps) {
  return (
    <label className="flex items-center gap-4 cursor-pointer group relative select-none">
      {/* Hidden Input */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer hidden"
      />

      {/* Visual Checkbox */}
      <div
        className={`relative w-[30px] h-[30px] border-2 rounded-sm bg-black transition-transform duration-300
          ${checked ? "border-[#a855f7]" : "border-[#6b21a8]"}
          group-hover:scale-105
          ${checked ? "shadow-[0_0_10px_#a855f7aa]" : ""}
        `}
      >
        {/* Checkmark */}
        <svg
          viewBox="0 0 24 24"
          className={`absolute inset-0 w-full h-full p-1 stroke-[#a855f7] stroke-2 fill-none
            scale-110 transition-all duration-500
            stroke-dasharray-[40]
            ${checked ? "stroke-dashoffset-0 opacity-100" : "stroke-dashoffset-[40] opacity-0"}
          `}
        >
          <path d="M3,12.5l7,7L21,5" />
        </svg>

        {/* Glow */}
        <div
          className={`absolute inset-0 rounded-sm bg-[#a855f7] blur-md transition-opacity duration-300
            ${checked ? "opacity-20" : "opacity-0"}
          `}
        />
      </div>

      {/* Label */}
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}
