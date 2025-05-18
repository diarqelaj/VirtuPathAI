'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HiOutlineChat, HiOutlineX } from 'react-icons/hi';
import dynamic from 'next/dynamic';

const ChatDrawer = dynamic(
    () => import('@/app/(dashboard)/messages/FloatingDrawer'),
    { ssr: false }
  );

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Auto-hide when on full messages page
  if (pathname?.startsWith('/messages')) return null;

  return (
    <>
      {/* ── Drawer (opens below chatbot) ── */}
      {open && (
        <div
        className="
          fixed bottom-[100px] right-4 md:right-6
          w-[360px] max-w-[92vw]
          h-[520px] max-h-[80vh]
          z-30
          bg-black-100
          rounded-2xl
          ring-1 ring-white/15
          shadow-xl
          overflow-hidden
          backdrop-blur-lg
          transition-all
        "
      >
      
          <ChatDrawer />
        </div>
      )}

      {/* ── Launcher button (above drawer, below chatbot) ── */}
      <button
        onClick={() => setOpen(!open)}
        className="
            fixed bottom-6 right-6
            z-20
            flex items-center gap-2
            px-4 py-2
            bg-black-100
            text-white
            text-sm font-medium
            rounded-xl
            ring-1 ring-white/20
            shadow-md
            hover:bg-white/10
            transition backdrop-blur
            border border-white/10
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
    </>
  );
}
