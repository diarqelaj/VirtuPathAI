'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HiOutlineChat, HiOutlineX } from 'react-icons/hi';
import dynamic from 'next/dynamic';

const ChatDrawer = dynamic(
  () => import('@/app/(dashboard)/messages/page'),
  { ssr: false }
);

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ❌ Hide if inside full /messages route
  if (pathname?.startsWith('/messages')) return null;

  return (
    <>
      {/* ── Launcher Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-[108px] right-6
          z-30
          flex items-center gap-2
          px-4 py-2
          text-sm font-medium text-white
          bg-black-100
          rounded-xl
          ring-1 ring-white/20
          hover:bg-white/10
          transition
          backdrop-blur
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

      {/* ── Drawer ── */}
      {open && (
        <div
          className="
            fixed bottom-[180px] right-4 md:right-6
            w-[92vw] sm:w-[460px] md:w-[500px]
            h-[72vh]
            z-30
            bg-black-100
            rounded-3xl
            ring-1 ring-white/15
            shadow-2xl
            overflow-hidden
            backdrop-blur-lg
            transition-all
          "
        >
          <ChatDrawer />
        </div>
      )}
    </>
  );
}
