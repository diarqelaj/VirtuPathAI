'use client';

import { useState } from 'react';
import { HiOutlineChat, HiOutlineX } from 'react-icons/hi';
import dynamic from 'next/dynamic';

// Lazy-load the heavy chat page only when opened
const ChatDrawer = dynamic(
    () => import('@/app/(dashboard)/messages/page'),   // 👈 the new path
    { ssr: false }
  );

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg focus:outline-none"
      >
        {open ? (
          <HiOutlineX className="w-7 h-7 text-white" />
        ) : (
          <HiOutlineChat className="w-7 h-7 text-white" />
        )}
      </button>

      {/* drawer */}
      {open && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-[420px] h-[70vh] z-40 rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black-100">
          <ChatDrawer />
        </div>
      )}
    </>
  );
}
