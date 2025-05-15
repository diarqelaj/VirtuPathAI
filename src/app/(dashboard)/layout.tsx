'use client';

import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-black-100 text-white overflow-hidden">
      <Sidebar />
      <main className="flex flex-col flex-1 overflow-hidden">
        <header className="w-full h-16 bg-[#0b0b22] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-50">
          {/* Add topbar items like search and bell here if needed */}
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </main>
    </div>
  );
}
