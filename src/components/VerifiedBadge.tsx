'use client';
import { useState } from 'react';

export const VerifiedBadge = ({ date }: { date?: string }) => {
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
        className="w-[18px] h-[18px] text-[#1D9BF0] fill-current"
      >
        <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816..." />
      </svg>

      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 z-50 rounded-xl bg-black-100 text-white shadow border border-white/10 text-sm px-4 py-3">
          <div className="font-semibold text-white">Verified Account</div>
          {formattedDate && (
            <div className="text-white/70 text-xs mt-1">Verified on {formattedDate}</div>
          )}
        </div>
      )}
    </div>
  );
};


