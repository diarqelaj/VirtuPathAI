'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0b0b22] text-white overflow-hidden">
      {/* Sidebar is fixed */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar is always full width, fixed at top */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 pt-20 md:pt-24">
          {children}
        </main>
      </div>
    </div>
  );
}
