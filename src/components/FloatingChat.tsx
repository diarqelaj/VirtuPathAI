'use client';

import { useState } from 'react';
import { HiOutlineChat, HiOutlineX } from 'react-icons/hi';
import dynamic from 'next/dynamic';

// lazy-load chat drawer
const ChatDrawer = dynamic(
  () => import('@/app/(dashboard)/messages/page'),
  { ssr: false }
);

/* Styling notes  ────────────────
   bg-black-100    → your custom dark tone
   ring-white/20   → subtle white glow
*/
export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── launcher ── */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-[100px]   /* 20 px above chatbot (80 px circle) */
          right-6
          z-50
          flex items-center gap-3
          pl-4 pr-3 py-3
          bg-black-100
          text-sm font-medium
          rounded-xl
          ring-1 ring-white/20
          shadow-lg
          hover:bg-white/10
          transition
        "
      >
        {open ? (
          <>
            <HiOutlineX className="w-5 h-5" />
            Close
          </>
        ) : (
          <>
            <HiOutlineChat className="w-5 h-5" />
            Messages
          </>
        )}
      </button>

      {/* ── drawer ── */}
      {open && (
        <div
          className="
            fixed bottom-[180px] right-4 md:right-6
            w-[90vw] md:w-[420px] h-[70vh]
            z-50
            bg-black-100 ring-1 ring-white/15 rounded-2xl
            shadow-2xl overflow-hidden
          "
        >
          <ChatDrawer />
        </div>
      )}
    </>
  );
}
