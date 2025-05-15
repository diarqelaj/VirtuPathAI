'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar'; // new component we’ll build

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0b0b22] text-white overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
