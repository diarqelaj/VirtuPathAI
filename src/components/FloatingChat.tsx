'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HiOutlineChat, HiOutlineX } from 'react-icons/hi';
import dynamic from 'next/dynamic';

// Lazy-load the chat drawer
const ChatDrawer = dynamic(
  () => import('@/app/(dashboard)/messages/page'),
  { ssr: false }
);

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Auto-hide if already in full messages view
  if (pathname.startsWith('/dashboard/messages')) return null;

  return (
    <>
      {/* ── launcher ── */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-[100px]   /* 20px above chatbot */
          right-6
          z-40
          flex items-center gap-3
          px-4 py-2
          bg-black-100
          text-sm font-medium text-white
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

      {/* ── floating drawer ── */}
      {open && (
        <div
          className="
            fixed bottom-[180px] right-4 md:right-6
            w-[90vw] md:w-[420px] h-[70vh]
            z-40
            bg-black-100
            ring-1 ring-white/15
            shadow-2xl
            rounded-2xl
            overflow-hidden
          "
        >
          <ChatDrawer />
        </div>
      )}
    </>
  );
}
