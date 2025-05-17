'use client';
import { useState } from 'react';

export const OfficialBadge = ({ date }: { date?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        viewBox="0 0 22 22"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[18px] h-[18px] fill-[#D18800]"
      >
        <path d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506..." />
      </svg>

      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 z-50 rounded-xl bg-black-100 text-white shadow border border-white/10 text-sm px-4 py-3">
          <div className="font-semibold text-white">This account is verified because its the official VirtuPath account</div>
          {formattedDate && (
            <div className="text-white/70 text-xs mt-1">Verified on {formattedDate}</div>
          )}
        </div>
      )}
    </div>
  );
};

