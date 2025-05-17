'use client';
import { useState } from 'react';

export const OfficialBadge = ({ date }: { date?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Golden SVG */}
      <svg
        viewBox="0 0 22 22"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[18px] h-[18px]"
      >
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="4"
            y1="1.5"
            x2="19.5"
            y2="22"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F4E72A" />
            <stop offset=".539" stopColor="#CD8105" />
            <stop offset=".68" stopColor="#CB7B00" />
            <stop offset="1" stopColor="#F4EC26" />
            <stop offset="1" stopColor="#F4E72A" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="5"
            y1="2.5"
            x2="17.5"
            y2="19.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9E87F" />
            <stop offset=".406" stopColor="#E2B719" />
            <stop offset=".989" stopColor="#E2B719" />
          </linearGradient>
        </defs>
        <g>
          <path
            clipRule="evenodd"
            fill="url(#paint0_linear)"
            fillRule="evenodd"
            d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506-.624 3.558-3.19 1.692L2.6 11l-1.586 3.245 3.19 1.692.624 3.558 3.576-.506L11 21.5l2.596-2.511 3.576.506.624-3.558 3.19-1.692L19.4 11l1.586-3.245-3.19-1.692-.624-3.558-3.576.506zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
          />
          <path
            clipRule="evenodd"
            fill="url(#paint1_linear)"
            fillRule="evenodd"
            d="M13.348 3.772L11 1.5 8.651 3.772l-3.235-.458-.565 3.219-2.886 1.531L3.4 11l-1.435 2.936 2.886 1.531.565 3.219 3.235-.458L11 20.5l2.348-2.272 3.236.458.564-3.219 2.887-1.531L18.6 11l1.435-2.936-2.887-1.531-.564-3.219-3.236.458zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
          />
          <path
            clipRule="evenodd"
            fill="#D18800"
            fillRule="evenodd"
            d="M6 11.39l3.74 3.74 6.197-6.767h.003V9.76l-6.2 6.77L6 12.79v-1.4zm0 0z"
          />
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 z-50 rounded-xl bg-black-100 text-white shadow-lg border border-white/10 text-sm px-4 py-3">

          <div className="font-semibold text-white">Verified Account</div>
          <div className="text-white/70 text-xs mt-1">
            This account is verified because it’s the official VirtuPath account
          </div>
          {formattedDate && (
            <div className="text-white/60 text-xs mt-1">Verified on {formattedDate}</div>
          )}
        </div>
      )}
    </div>
  );
};
