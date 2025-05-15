import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black-100 text-white">
      <Sidebar />
      <main className="flex-1 px-6 md:px-10 py-10">{children}</main>
    </div>
  );
}
