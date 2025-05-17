'use client';

export const OfficialBadge = () => (
  <div className="group relative inline-block">
    <svg
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
    >
      <defs>
        <linearGradient id="officialBadgeGradient0" x1="4" y1="1.5" x2="19.5" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4E72A" />
          <stop offset="0.539" stopColor="#CD8105" />
          <stop offset="0.68" stopColor="#CB7B00" />
          <stop offset="1" stopColor="#F4EC26" />
          <stop offset="1" stopColor="#F4E72A" />
        </linearGradient>
        <linearGradient id="officialBadgeGradient1" x1="5" y1="2.5" x2="17.5" y2="19.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9E87F" />
          <stop offset="0.406" stopColor="#E2B719" />
          <stop offset="0.989" stopColor="#E2B719" />
        </linearGradient>
      </defs>
      <path
        d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506-.624 3.558-3.19 1.692L2.6 11l-1.586 3.245 3.19 1.692.624 3.558 3.576-.506L11 21.5l2.596-2.511 3.576.506.624-3.558 3.19-1.692L19.4 11l1.586-3.245-3.19-1.692-.624-3.558-3.576.506zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
        fill="url(#officialBadgeGradient0)"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M13.348 3.772L11 1.5 8.651 3.772l-3.235-.458-.565 3.219-2.886 1.531L3.4 11l-1.435 2.936 2.886 1.531.565 3.219 3.235-.458L11 20.5l2.348-2.272 3.236.458.564-3.219 2.887-1.531L18.6 11l1.435-2.936-2.887-1.531-.564-3.219-3.236.458zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
        fill="url(#officialBadgeGradient1)"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M6 11.39l3.74 3.74 6.197-6.767h.003V9.76l-6.2 6.77L6 12.79v-1.4zm0 0z"
        fill="#D18800"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>

    <div className="absolute left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-zinc-800 text-white text-xs px-3 py-1 rounded-md shadow-md z-50 transition-tooltip duration-200 opacity-0 group-hover:opacity-100">
      Official VirtuPath Profile
    </div>
  </div>
);

